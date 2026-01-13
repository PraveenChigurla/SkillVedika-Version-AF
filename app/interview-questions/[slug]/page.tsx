import { Metadata } from 'next';
import InterviewHero from '@/components/interview-questions/InterviewHero';
import QuestionList from '@/components/interview-questions/QuestionList';
import InternalLinks from '@/components/interview-questions/InternalLinks';
import DemoSection from '@/components/blog-detail/DemoSection';
import { getCanonicalUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

// Helper to resolve slug from props (Next.js 16 compatible)
async function resolveSlug(props: any): Promise<string> {
  const propsResolved = await props;
  const paramsResolved = await propsResolved.params;
  const slugRaw = paramsResolved?.slug;
  return Array.isArray(slugRaw) ? slugRaw[0] : slugRaw;
}

// Dummy data - will be replaced with API call later
const getInterviewData = (slug: string) => {
  const dataMap: Record<string, any> = {
    python: {
      name: 'Python',
      description:
        'Prepare for Python interviews with commonly asked questions covering data structures, algorithms, frameworks like Django and Flask, and Python best practices. These questions are frequently asked in technical interviews for Python developer roles.',
      questions: [
        {
          id: 1,
          question: 'What is the difference between list and tuple in Python?',
          answer:
            '**Lists** are mutable (can be modified after creation) and defined with square brackets `[]`.\n\n**Tuples** are immutable (cannot be modified after creation) and defined with parentheses `()`.\n\n**Key Differences:**\n- Lists: Mutable, use `[]`, slower for iteration\n- Tuples: Immutable, use `()`, faster for iteration, can be used as dictionary keys\n\n**Example:**\n```python\n# List - mutable\nmy_list = [1, 2, 3]\nmy_list.append(4)  # OK\n\n# Tuple - immutable\nmy_tuple = (1, 2, 3)\nmy_tuple.append(4)  # Error: tuples are immutable\n```',
        },
        {
          id: 2,
          question: 'Explain Python decorators with an example.',
          answer:
            'Decorators are functions that modify the behavior of other functions without changing their code.\n\n**Example:**\n```python\ndef my_decorator(func):\n    def wrapper():\n        print("Before function call")\n        func()\n        print("After function call")\n    return wrapper\n\n@my_decorator\ndef say_hello():\n    print("Hello!")\n\nsay_hello()\n# Output:\n# Before function call\n# Hello!\n# After function call\n```\n\nDecorators are commonly used for logging, authentication, caching, and more.',
        },
        {
          id: 3,
          question: 'What is the difference between `__str__` and `__repr__`?',
          answer:
            'Both are special methods for string representation:\n\n**`__str__`**: User-friendly string representation (for end users)\n**`__repr__`**: Developer-friendly string representation (should be unambiguous, ideally executable)\n\n**Example:**\n```python\nclass Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n    \n    def __str__(self):\n        return f"{self.name}, {self.age} years old"\n    \n    def __repr__(self):\n        return f"Person(\'{self.name}\', {self.age})"\n\np = Person("John", 30)\nprint(str(p))    # John, 30 years old\nprint(repr(p))   # Person(\'John\', 30)\n```',
        },
        {
          id: 4,
          question: 'How does Python handle memory management?',
          answer:
            'Python uses automatic memory management through **garbage collection**:\n\n1. **Reference Counting**: Primary method - counts references to objects\n2. **Cyclic Garbage Collector**: Handles circular references\n3. **Memory Pools**: Manages memory allocation efficiently\n\n**Key Points:**\n- Objects are automatically deallocated when reference count reaches zero\n- `del` statement decreases reference count\n- Garbage collector runs periodically to clean up circular references\n- Python handles memory management, so developers don\'t need to manually allocate/deallocate',
        },
        {
          id: 5,
          question: 'Explain the Global Interpreter Lock (GIL) in Python.',
          answer:
            'The **GIL (Global Interpreter Lock)** is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecode simultaneously.\n\n**Key Points:**\n- Only one thread can execute Python code at a time\n- GIL prevents true parallelism for CPU-bound tasks\n- I/O-bound tasks can still benefit from threading\n- Multiprocessing can bypass GIL for CPU-bound tasks\n\n**When to use:**\n- **Threading**: I/O-bound operations (file I/O, network requests)\n- **Multiprocessing**: CPU-bound operations (computation, data processing)',
        },
      ],
    },
    javascript: {
      name: 'JavaScript',
      description:
        'Master JavaScript interview questions covering ES6+, closures, async programming, event loop, and modern frameworks. Essential for frontend and full-stack developer interviews.',
      questions: [
        {
          id: 1,
          question: 'What is the difference between let, const, and var?',
          answer:
            '**var**: Function-scoped, hoisted, can be redeclared\n**let**: Block-scoped, hoisted but not initialized (TDZ), cannot be redeclared\n**const**: Block-scoped, must be initialized, cannot be reassigned\n\n**Example:**\n```javascript\n// var - function scoped\nfunction example() {\n  if (true) {\n    var x = 1;\n  }\n  console.log(x); // 1 (accessible)\n}\n\n// let/const - block scoped\nif (true) {\n  let y = 2;\n  const z = 3;\n}\nconsole.log(y); // ReferenceError\n```',
        },
        {
          id: 2,
          question: 'Explain closures in JavaScript.',
          answer:
            'A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned.\n\n**Example:**\n```javascript\nfunction outerFunction(x) {\n  return function innerFunction(y) {\n    return x + y;\n  };\n}\n\nconst addFive = outerFunction(5);\nconsole.log(addFive(3)); // 8\n```\n\nClosures are useful for data privacy, function factories, and event handlers.',
        },
        {
          id: 3,
          question: 'What is the event loop in JavaScript?',
          answer:
            'The **event loop** is JavaScript\'s mechanism for handling asynchronous operations.\n\n**How it works:**\n1. Call stack executes synchronous code\n2. Web APIs handle async operations (setTimeout, fetch, etc.)\n3. Callback queue holds completed async operations\n4. Event loop moves callbacks from queue to stack when stack is empty\n\n**Example:**\n```javascript\nconsole.log("1");\nsetTimeout(() => console.log("2"), 0);\nconsole.log("3");\n// Output: 1, 3, 2\n```',
        },
      ],
    },
    java: {
      name: 'Java',
      description:
        'Comprehensive Java interview questions covering OOP principles, collections framework, multithreading, Spring framework, and JVM internals. Essential for Java developer positions.',
      questions: [
        {
          id: 1,
          question: 'What is the difference between ArrayList and LinkedList?',
          answer:
            '**ArrayList**:\n- Dynamic array implementation\n- Fast random access (O(1))\n- Slow insertion/deletion in middle (O(n))\n- Better for frequent access\n\n**LinkedList**:\n- Doubly linked list implementation\n- Slow random access (O(n))\n- Fast insertion/deletion (O(1))\n- Better for frequent insertions/deletions',
        },
        {
          id: 2,
          question: 'Explain the difference between == and equals() in Java.',
          answer:
            '**==** compares references (memory addresses)\n**equals()** compares object content (can be overridden)\n\n**Example:**\n```java\nString s1 = new String("hello");\nString s2 = new String("hello");\n\ns1 == s2;        // false (different references)\ns1.equals(s2);  // true (same content)\n```',
        },
      ],
    },
  };

  // Default fallback data
  const defaultData = {
    name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
    description: `Prepare for ${slug} interviews with commonly asked questions and detailed answers.`,
    questions: [
      {
        id: 1,
        question: `What are the key concepts in ${slug}?`,
        answer: `This is a sample question for ${slug}. Detailed answers will be available soon.`,
      },
    ],
  };

  return dataMap[slug] || defaultData;
};

export async function generateMetadata(props: any): Promise<Metadata> {
  const slug = await resolveSlug(props);
  const data = getInterviewData(slug);
  const canonicalUrl = getCanonicalUrl(`/interview-questions/${slug}`);

  const title = `${data.name} Interview Questions & Answers | SkillVedika`;
  const description = `Prepare for ${data.name} interviews with commonly asked ${data.name} interview questions and answers.`;

  return {
    title,
    description,
    keywords: [
      `${data.name} interview questions`,
      `${data.name} interview`,
      `${data.name} Q&A`,
      'technical interview',
      'coding interview',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function InterviewQuestionDetailPage(props: any) {
  const slug = await resolveSlug(props);
  const data = getInterviewData(slug);

  // Fetch courses and form details for DemoSection
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  let allCourses: any[] = [];
  let formDetails: any = null;

  try {
    const [coursesRes, formDetailsRes] = await Promise.allSettled([
      fetch(`${apiUrl}/courses`, { next: { revalidate: 86400 } }),
      fetch(`${apiUrl}/form-details`, { cache: 'force-cache', next: { revalidate: 3600 } }),
    ]);

    if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
      const json = await coursesRes.value.json();
      allCourses = Array.isArray(json) ? json : json?.data || json?.courses || [];
    }

    if (formDetailsRes.status === 'fulfilled' && formDetailsRes.value.ok) {
      const json = await formDetailsRes.value.json();
      const payload = json.data ?? json;
      formDetails = Array.isArray(payload) ? payload[payload.length - 1] : payload;
    }
  } catch {
    // Silently fail - use empty arrays
  }

  return (
    <main className="min-h-screen bg-white">
      <InterviewHero skillName={data.name} description={data.description} />
      <QuestionList questions={data.questions} />
      <InternalLinks />
      <DemoSection allCourses={allCourses} formDetails={formDetails} />
    </main>
  );
}

