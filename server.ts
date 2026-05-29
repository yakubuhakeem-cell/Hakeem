import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI if apiKey is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Successfully initialized Google GenAI SDK.");
  } catch (e) {
    console.error("Failed to initialize Google GenAI SDK:", e);
  }
} else {
  console.log("GEMINI_API_KEY not found in environment. Generating local AI simulations.");
}

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// School General Info API
app.get("/api/school-info", (req, res) => {
  res.json({
    name: "Saako Holy Child Academy",
    motto: "Holiness is our key",
    phone: "+233545029200",
    email: "saakohca@gmail.com",
    address: "Jelinkon road, Sawla, Savannah Region, Ghana",
    established: 2003,
    coreValues: ["Holiness", "Integrity", "Academic Excellence", "Self-discipline"],
  });
});

// AI Report Card Comment Generator Endpoint
app.post("/api/ai/report-comment", async (req, res) => {
  const { studentName, grade, performanceLevel, subjects, behaviorRating, keyTraits } = req.body;

  if (!studentName || !grade) {
    return res.status(400).json({ error: "Student name and grade are required." });
  }

  const subjectsSummary = subjects && subjects.length > 0 
    ? subjects.map((s: any) => `${s.name}: ${s.score}%`).join(", ")
    : "General performance";

  const systemInstruction = `You are an expert Headteacher and Academic Advisor at Saako Holy Child Academy in Ghana.
The school's motto is "Holiness is our key". Your language should be encouraging, highly professional, polite, constructive, and reflect the school's commitment to both high educational standards and strong moral faith and ethical character (holiness, moral uprightness). Keep comments concise (around 100-150 words) and suitable for a terminal report card. Do not use Markdown formatting like asterisks or hashtags. Just plain paragraphs.`;

  const prompt = `Generate a terminal academic report card comment for:
Student Name: ${studentName}
Grade/Class: ${grade}
Overall Performance Level: ${performanceLevel || "Average student"}
Academic Scores: ${subjectsSummary}
Behavior and Conduct: ${behaviorRating || "Good"}
Key Personal Traits: ${keyTraits ? keyTraits.join(", ") : "Deliberate and polite"}

Provide feedback with three core elements:
1. Praise for academic and character strengths (referencing our school motto and motto values of holiness and discipline).
2. Key constructive recommendations/areas of improvement in specific subjects or school activities.
3. An encouraging prayerful or motivating closing statement for the coming term.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
        }
      });
      res.json({ comment: response.text });
    } catch (err: any) {
      console.error("Gemini API error generating report comment:", err);
      res.status(500).json({ 
        error: "Failed to connect to AI server. Generating mock response.",
        comment: generateMockComment(studentName, performanceLevel, behaviorRating, keyTraits)
      });
    }
  } else {
    // Generate lovely localized simulated comment if API key is not yet set
    const mockComment = generateMockComment(studentName, performanceLevel, behaviorRating, keyTraits);
    res.json({ comment: mockComment, isSimulated: true });
  }
});

// AI Lesson Plan Generator Endpoint
app.post("/api/ai/lesson-plan", async (req, res) => {
  const { subject, grade, topic, duration, objectives, classDetails } = req.body;

  if (!subject || !topic || !grade) {
    return res.status(400).json({ error: "Subject, topic, and grade are required." });
  }

  const systemInstruction = `You are a curriculum developer at Saako Holy Child Academy, following Ghana Education Service (GES) standards.
The school motto is "Holiness is our key". Generate high-quality lesson plans integrated with moral teaching, holiness principles, or ethical responsibility where applicable. Return the response in formatted text.`;

  const prompt = `Create a fully-detailed GES-aligned Lesson Plan with the following criteria:
- School: Saako Holy Child Academy
- Subject: ${subject}
- Class/Grade: ${grade}
- Topic: ${topic}
- Duration: ${duration || "60 minutes"}
- Major Objectives: ${objectives || "Understand the foundational concepts of the topic."}
- Class Context: ${classDetails || "Co-educational, varied learning abilities"}

The lesson plan MUST contain:
1. Learning Indicators & Materials Needed
2. Introduction (Starter / Brainstorming Activity - 10 mins)
3. Main Activities (Step-by-step Teaching & Learning Phase - 35 mins, focusing on explanation, active participation, and school values alignment)
4. Conclusion (Wrap-up, summary, and takeaway - 10 mins)
5. Student Assessment (Questions or tasks to test understanding - 5 mins)`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
        }
      });
      res.json({ lessonPlan: response.text });
    } catch (err: any) {
      console.error("Gemini API error generating lesson plan:", err);
      res.status(500).json({
        error: "Failed to connect to AI server.",
        lessonPlan: generateMockLessonPlan(subject, grade, topic, duration)
      });
    }
  } else {
    const mockPlan = generateMockLessonPlan(subject, grade, topic, duration);
    res.json({ lessonPlan: mockPlan, isSimulated: true });
  }
});

// Helper functions for mock fallback outputs (ensuring excellent offline-first / initial setup robustness)
function generateMockComment(name: string, level: string, conduct: string, traits: any[]): string {
  const traitStr = traits && traits.length ? traits.join(" and ") : "focused";
  return `${name} is an exceptionally pleasant student who continues to bring joy to the Saako Holy Child Academy family. Academically, ${name} is performing at a ${level || "commendable"} level. In terms of character and conduct, ${name} has been marked as ${conduct || "excellent/orderly"}, exemplifying our school motto, "Holiness is our key." ${name} shows high rates of participation and is frequently described as ${traitStr}. To reach their full potential, ${name} should dedicate more private study hours to math computations and science reviews. We encourage ${name} to keep working hard and trust in God for higher accomplishments in the next academic term!`;
}

function generateMockLessonPlan(subject: string, grade: string, topic: string, duration: string): string {
  return `SAAKO HOLY CHILD ACADEMY LESSON PLAN
========================================
Motto: Holiness is our Key | Phone: +233545029200
----------------------------------------
Subject: ${subject}
Grade/Class: ${grade}
Topic: ${topic}
Duration: ${duration || "60 minutes"}

1. SPECIFIC LEARNING OBJECTIVES
By the end of the lesson, the pupil will be able to:
- Explain the key concepts of ${topic} correctly.
- Identify real-life applications of ${topic} within their immediate environment.
- Value the principles of honesty, dedication, and detail in analyzing ${topic}.

2. TEACHING AND LEARNING MATERIALS (TLMs)
- Standard text, white board markers, and charts illustrating ${topic}.
- Real-world samples or interactive illustrations for physical classes.

3. METHODOLOGY / SYSTEMATIC LESSON STEPS
- Starter Activity (10 Minutes):
  Begin with an introductory prayer. Prompt pupils with brainstorming questions, connecting ${topic} with previous knowledge.
- Core Activity Step 1: Teacher Modeling (15 Minutes):
  Explain the core rules of ${topic}. Break down concepts on the board and check for feedback.
- Core Activity Step 2: Guided Practice (15 Minutes):
  Let pupils tackle sample items in pairs. Circle the room to offer positive feedback and keep classroom management highly structured.
- Core Activity Step 3: Moral Reflection & Values Integration (5 Minutes):
  Tie the concepts of ${topic} to truthfulness, excellence, and school spirit, embodying "Holiness is our key".

4. CONCLUSION (10 Minutes)
- Review the major facts. Ask randomized questions. Provide praise for accurate replies.

5. SEATWORK / ASSESSMENT (5 Minutes)
- Question 1: Outline the definition of ${topic} in your own words.
- Question 2: Draft two problems showcasing this topic.`;
}

// ----------------------------------------------------
// NODE PORT ROUTING & VITE MIDDLEWARE
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static handler mounted for directory:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Saako Holy Child Academy Server running on http://localhost:${PORT}`);
  });
}

startServer();
