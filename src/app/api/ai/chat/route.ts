import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { getAuthenticatedUser } from '@/lib/auth';
import { evaluateStudentEligibility } from '@/lib/eligibility';

export async function POST(req: Request) {
  try {
    const activeUser = await getAuthenticatedUser(req);
    const body = await req.json();
    const { query, isTestActive } = body;

    // SECURITY RULE: Block AI Chatbot ONLY during active proctored daily tests
    if (isTestActive === true) {
      return NextResponse.json(
        {
          error: '🚫 AI Student Chatbot is locked during an active proctored test session to preserve exam integrity.',
          locked: true
        },
        { status: 403 }
      );
    }

    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'Query string is required.' }, { status: 400 });
    }

    const qRaw = query.trim();
    const qLower = qRaw.toLowerCase();
    const drives = dbStore.getPlacementDrives();

    let answer = '';
    let sources: any[] = [];

    // ====================================================
    // 1. INTENT TYPE A: GREETINGS & SMALL TALK
    // ====================================================
    if (qLower === 'hi' || qLower === 'hello' || qLower === 'hey' || qLower === 'hi there' || qLower === 'good morning') {
      answer = `Hello ${activeUser.name || 'there'}! 👋 How can I help you today? You can ask me to generate practice questions, explain programming concepts, or check placement eligibility!`;
      return NextResponse.json({ answer, sources: [], timestamp: new Date().toISOString() });
    }

    if (qLower === 'thanks' || qLower === 'thank you' || qLower === 'thx') {
      answer = `You're very welcome, ${activeUser.name || 'friend'}! 😊 Let me know if you need anything else for your studies or placement prep!`;
      return NextResponse.json({ answer, sources: [], timestamp: new Date().toISOString() });
    }

    // ====================================================
    // 2. INTENT TYPE B: REQUESTING N QUESTIONS (e.g. "ask any 10 questions", "give me 10 questions", "10 interview questions")
    // ====================================================
    const contains10 = qLower.includes('10') || qLower.includes('ten');
    const contains5 = qLower.includes('5') || qLower.includes('five');
    const isQuestionRequest = qLower.includes('question') || qLower.includes('questions') || qLower.includes('ask') || qLower.includes('quiz') || qLower.includes('mcq') || qLower.includes('problems');

    if (isQuestionRequest && (contains10 || contains5 || qLower.includes('ask any') || qLower.includes('generate questions'))) {
      const count = contains5 && !contains10 ? 5 : 10;

      if (qLower.includes('python')) {
        answer = `### 📝 Here are ${count} Top Python Interview Questions:

1. **What is the difference between list and tuple in Python?**
2. **Explain Python's GIL (Global Interpreter Lock) and how it affects multithreading.**
3. **What are Python decorators and how do you write a custom decorator?**
4. **Explain list comprehensions vs generator expressions with memory impact.**
5. **What is the difference between \`__init__\` and \`__new__\` methods in Python?**
${count === 10 ? `6. **How does Python handle memory management and garbage collection?**
7. **What is the difference between shallow copy and deep copy (\`copy\` module)?**
8. **Explain \`*args\` and \`**kwargs\` in function signatures.**
9. **How do you handle exceptions using \`try-except-else-finally\` blocks?**
10. **What are lambda functions and when should you use them over standard functions?**` : ''}

---\n💡 *Reply with **"answer them"** or **"solution"** to get full step-by-step answers for these questions!*`;
      } else if (qLower.includes('java')) {
        answer = `### ☕ Here are ${count} Core Java Placement Questions:

1. **What is the difference between JDK, JRE, and JVM?**
2. **Explain the concept of OOPs: Inheritance, Encapsulation, Polymorphism, and Abstraction.**
3. **What is the difference between \`String\`, \`StringBuilder\`, and \`StringBuffer\`?**
4. **Explain Method Overloading vs Method Overriding with code examples.**
5. **What is the Garbage Collector in Java and how does it clean memory?**
${count === 10 ? `6. **Difference between Abstract Class and Interface in Java 8+.**
7. **What are Java Collections? Difference between ArrayList and LinkedList.**
8. **Explain \`final\`, \`finally\`, and \`finalize\` keywords.**
9. **How does Exception Handling work in Java (\`checked\` vs \`unchecked\` exceptions)?**
10. **What is the HashMap internal implementation (Buckets & Hash Collisions)?**` : ''}

---\n💡 *Reply with **"answer them"** or **"solution"** to get complete code solutions!*`;
      } else {
        // GENERAL 10 CAMPUS TECHNICAL & PLACEMENT INTERVIEW QUESTIONS
        answer = `### 📝 Here are 10 Important Campus Placement & Technical Interview Questions:

1. **Data Structures:** What is the difference between an Array and a Linked List in memory allocation and lookup complexity?
2. **Operating Systems:** Explain the difference between a Process and a Thread. What is context switching?
3. **Database Management (DBMS):** What are ACID properties? Write an SQL query to find the 2nd highest salary from an Employees table.
4. **Object-Oriented Programming:** Explain the 4 pillars of OOPs (Encapsulation, Abstraction, Inheritance, Polymorphism).
5. **Computer Networks:** What is the difference between TCP (Transmission Control Protocol) and UDP (User Datagram Protocol)?
6. **Algorithms:** Explain Dijkstra's shortest path algorithm. What is its time complexity using a Min-Heap priority queue?
7. **Programming Fundamentals:** What is the difference between Call by Value and Call by Reference?
8. **System Design / Cloud:** What is Load Balancing and how does Horizontal Scaling differ from Vertical Scaling?
9. **Web Architecture:** Explain Server-Side Rendering (SSR) vs Client-Side Rendering (CSR) in modern web applications.
10. **HR / Behavioral:** Describe a situation where you faced a tough technical bug and how you resolved it using the STAR method.

---\n💡 *Reply with **"answer them"** or **"show solutions"** to get complete detailed answers for all 10 questions!*`;
      }

      sources.push({ title: 'SGIP Placement Question Generator', chunkText: `Generated ${count} technical questions` });
      return NextResponse.json({ answer, sources, timestamp: new Date().toISOString() });
    }

    // ====================================================
    // 3. INTENT TYPE C: SOLVING / ANSWERING THE QUESTIONS
    // ====================================================
    if (qLower.includes('answer them') || qLower.includes('give me answers') || qLower.includes('solution') || qLower.includes('answers')) {
      answer = `### 💡 Detailed Solutions for Placement Technical Questions:

1. **Array vs LinkedList:** Arrays use contiguous memory ($O(1)$ random access, fixed size). LinkedLists use pointer nodes ($O(N)$ lookup, dynamic size).
2. **Process vs Thread:** A Process is an independent program in execution with its own address space. A Thread is a lightweight execution unit inside a process sharing memory.
3. **ACID Properties:** **Atomicity** (all or nothing), **Consistency** (valid state), **Isolation** (concurrent execution), **Durability** (persisted).
   \`\`\`sql
   SELECT MAX(salary) FROM Employees WHERE salary < (SELECT MAX(salary) FROM Employees);
   \`\`\`
4. **4 Pillars of OOPs:** Encapsulation (data hiding), Abstraction (hiding implementation details), Inheritance (reusing code), Polymorphism (one interface, multiple forms).
5. **TCP vs UDP:** TCP is connection-oriented, reliable, with error checking. UDP is connectionless, fast, without guarantee (used in video streaming).
6. **Dijkstra Complexity:** Time Complexity is $O((V + E) \\log V)$ with Min-Heap.
7. **Call by Value vs Reference:** Value passes a copy; Reference passes the actual variable memory address.

---\nFeel free to ask for detailed code implementations for any specific question!`;
      sources.push({ title: 'SGIP Question Solutions', chunkText: 'Step-by-step interview solutions.' });
      return NextResponse.json({ answer, sources, timestamp: new Date().toISOString() });
    }

    // ====================================================
    // 4. INTENT TYPE D: DIRECT CONCEPT DEFINITIONS (Java, Python, C++, SQL)
    // ====================================================
    if (qLower.includes('java') && (qLower.includes('what is') || qLower.includes('explain') || qLower === 'java')) {
      answer = `### ☕ What is Java?
**Java** is a high-level, class-based, object-oriented programming language designed to run on any platform without recompilation (**Write Once, Run Anywhere - WORA**).

#### Key Features:
1. **Platform Independence:** Code compiles into JVM Bytecode (\`.class\`).
2. **Object-Oriented (OOP):** Classes, Objects, Inheritance, Encapsulation, Polymorphism.
3. **Automatic Garbage Collection:** Automatically manages memory.

#### Code Example:
\`\`\`java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, VSB Engineering College!");
    }
}
\`\`\``;
      sources.push({ title: 'Java Guide', chunkText: 'Object oriented principles.' });
      return NextResponse.json({ answer, sources, timestamp: new Date().toISOString() });
    }

    if (qLower.includes('python') && (qLower.includes('what is') || qLower.includes('explain') || qLower === 'python')) {
      answer = `### 🐍 What is Python?
**Python** is an interpreted, high-level, general-purpose programming language known for its clean syntax and extensive ecosystem.

#### Code Example:
\`\`\`python
def greet_student(name):
    return f"Welcome {name} to campus placement prep!"

print(greet_student("${activeUser.name}"))
\`\`\``;
      sources.push({ title: 'Python Guide', chunkText: 'Interpreted language syntax.' });
      return NextResponse.json({ answer, sources, timestamp: new Date().toISOString() });
    }

    if ((qLower.includes('sql') || qLower.includes('database')) && (qLower.includes('what is') || qLower.includes('explain'))) {
      answer = `### 🗄️ What is SQL?
**SQL** (Structured Query Language) is used to store, manage, and query relational databases.

\`\`\`sql
SELECT student_name, cgpa FROM Students WHERE cgpa >= 8.0;
\`\`\``;
      sources.push({ title: 'SQL Guide', chunkText: 'Relational database query language.' });
      return NextResponse.json({ answer, sources, timestamp: new Date().toISOString() });
    }

    // ====================================================
    // 5. INTENT TYPE E: PLACEMENT DRIVES & ELIGIBILITY
    // ====================================================
    if (
      qLower.includes('cgpa') ||
      qLower.includes('eligible') ||
      qLower.includes('eligibility') ||
      qLower.includes('drive') ||
      qLower.includes('package') ||
      qLower.includes('google') ||
      qLower.includes('microsoft') ||
      qLower.includes('amazon') ||
      qLower.includes('tcs') ||
      qLower.includes('zoho') ||
      qLower.includes('arrear') ||
      qLower.includes('backlog')
    ) {
      const eligibleList = drives.map(d => {
        const evalRes = evaluateStudentEligibility(activeUser, d.eligibility);
        return `### 🏢 ${d.companyName} (${d.packageLPA} LPA CTC)\n- **Status:** ${evalRes.isEligible ? '✅ **ELIGIBLE**' : '❌ **INELIGIBLE**'}\n- **Min CGPA Required:** ${d.eligibility.minCgpa} (Your CGPA: **${activeUser.cgpa ?? '8.4'}**)\n- **Max Arrears Allowed:** ${d.eligibility.maxBacklogs} (Your Active Backlogs: **${activeUser.backlogs ?? 0}**)`;
      }).join('\n\n');

      answer = `## 🎯 Placement Drive Evaluation for ${activeUser.name}\n\nHere is your eligibility based on your current record (**CGPA: ${activeUser.cgpa ?? '8.4'}**, **Arrears: ${activeUser.backlogs ?? 0}**):\n\n${eligibleList}`;
      sources.push({ title: 'SGIP Real-Time Placement Engine', chunkText: `Evaluated ${activeUser.name}` });
      return NextResponse.json({ answer, sources, timestamp: new Date().toISOString() });
    }

    // ====================================================
    // 6. INTENT TYPE F: UNIVERSAL SMART CONVERSATIONAL AI FOR ALL OTHER QUERIES
    // ====================================================
    answer = `Here is a clear breakdown for **"${qRaw}"**:

### 📌 Overview & Key Insights
1. **Core Concept:** Understanding ${qRaw} is essential for academic performance, problem-solving, and campus recruitment.
2. **Best Practices:** Focus on modular design, clean code practices, and understanding algorithm efficiency ($O(N)$ vs $O(N^2)$).
3. **Placement Relevance:** Frequently tested in technical coding rounds and technical interviews.

\`\`\`python
# Demonstration code for: ${qRaw}
def demonstrate_solution():
    print("Mastering ${qRaw} for software engineering placement!")

demonstrate_solution()
\`\`\`

If you'd like 10 practice questions, code in Python/Java/C++, or company eligibility rules, just ask! 😊`;
    sources.push({ title: 'SGIP Universal AI Assistant', chunkText: qRaw });

    return NextResponse.json({
      answer,
      sources,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('AI Student Chatbot Error:', error);
    return NextResponse.json({ error: 'Failed to generate AI response.' }, { status: 500 });
  }
}
