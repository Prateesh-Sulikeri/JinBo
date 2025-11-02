# 📚 How to Update Your Knowledge Base - Complete Guide

## 🎯 Understanding the KB Structure

Your `knowledge-base-v5.json` has 3 main sections:

1. **Personal Data** - Your info, skills, projects
2. **FAQs** - Question patterns and answers
3. **Templates** - URL patterns for dynamic links

---

## 📝 Step-by-Step: Adding New FAQs

### Pattern to Follow:

```json
"faq_category_name": {
  "questions": [
    "question variation 1",
    "question variation 2",
    "question variation 3"
  ],
  "answer": "Your response here. Use {placeholders} for dynamic content."
}
```

---

### Example 1: Adding "What's your favorite project?"

**Open `knowledge-base-v5.json` and find the `faqs` section.**

Add this:

```json
"favorite_project": {
  "questions": [
    "favorite project",
    "best project",
    "which project are you proud of",
    "proudest work",
    "top project"
  ],
  "answer": "My favorite is CloneCatch! It uses machine learning to detect code plagiarism. Check it out: {github_url}/CloneCatch"
}
```

**How it works:**
- User asks: "what's your favorite project?"
- Bot matches: "favorite project" (from questions array)
- Bot responds: The answer text
- `{github_url}` gets replaced with actual GitHub URL

---

### Example 2: Adding "Do you know React?"

```json
"react_experience": {
  "questions": [
    "do you know react",
    "react experience",
    "work with react",
    "react developer",
    "reactjs"
  ],
  "answer": "Yes! I have extensive React experience. Check out Portfolio 2025 ({portfolio}) - it's built entirely with React! I also use React with Node.js for full-stack projects."
}
```

---

### Example 3: Adding "What's your availability?"

```json
"work_hours": {
  "questions": [
    "availability",
    "work hours",
    "when can you work",
    "flexible schedule",
    "time zone"
  ],
  "answer": "I'm based in India (IST timezone) and available for full-time opportunities or freelance projects. Connect via LinkedIn ({linkedin_url}) to discuss specifics!"
}
```

---

## 🔧 Available Placeholders

You can use these in any answer:

| Placeholder | Replaced With | Example |
|------------|---------------|---------|
| `{github}` | GitHub username | `Prateesh-Sulikeri` |
| `{leetcode}` | LeetCode username | `sulikeriprateesh7` |
| `{linkedin}` | LinkedIn profile | `prateesh-sulikeri` |
| `{medium}` | Medium username | `@yourmedium` |
| `{portfolio}` | Portfolio URL | `https://...` |
| `{github_url}` | Full GitHub URL | `https://github.com/Prateesh-Sulikeri` |
| `{leetcode_url}` | Full LeetCode URL | `https://leetcode.com/u/...` |
| `{medium_url}` | Full Medium URL | `https://medium.com/@...` |

### For Dynamic Data (GitHub, LeetCode, Medium):

| Placeholder | Used In | Replaced With |
|------------|---------|---------------|
| `{repos}` | GitHub FAQ | Number of repos |
| `{stars}` | GitHub FAQ | Total stars |
| `{languages}` | GitHub FAQ | Top languages |
| `{latest_repo}` | GitHub FAQ | Latest repo name |
| `{total}` | LeetCode FAQ | Total solved |
| `{easy}` | LeetCode FAQ | Easy count |
| `{medium}` | LeetCode FAQ | Medium count |
| `{hard}` | LeetCode FAQ | Hard count |
| `{categories}` | LeetCode FAQ | Top categories |
| `{posts}` | Medium FAQ | List of posts |

---

## 🎨 Advanced: Adding Complex FAQs

### Example: Handling Multiple Intents

```json
"learning_path": {
  "questions": [
    "how to learn programming",
    "start coding",
    "learn development",
    "beginner advice",
    "tips for learning"
  ],
  "answer": "Great question! Here's what worked for me:\n\n1. Start with Python or JavaScript\n2. Build real projects (not just tutorials)\n3. Use GitHub to track progress\n4. Solve problems on LeetCode\n5. Read other people's code\n\nCheck my LeetCode journey: {leetcode_url} and GitHub: {github_url}"
}
```

---

## 📋 Common Patterns to Add

### 1. Technical Questions

```json
"specific_tech": {
  "questions": [
    "mongodb",
    "database experience",
    "work with databases",
    "sql"
  ],
  "answer": "I work with both SQL (PostgreSQL) and NoSQL (MongoDB) databases. I've built full-stack apps using MongoDB with Node.js, and also have experience with PostgreSQL for relational data. See examples in my GitHub repos: {github_url}"
}
```

### 2. Recruiter Questions

```json
"notice_period": {
  "questions": [
    "notice period",
    "when can you start",
    "availability to join",
    "joining date"
  ],
  "answer": "I'm currently open to opportunities and can discuss start dates based on the role. Let's connect on LinkedIn ({linkedin_url}) to discuss specifics!"
}
```

### 3. Student Questions

```json
"advice": {
  "questions": [
    "advice for students",
    "tips for beginners",
    "how to improve",
    "study tips"
  ],
  "answer": "My advice: Focus on building projects, not just watching tutorials. Start with small ideas and gradually increase complexity. Use Git from day one, solve LeetCode problems regularly, and don't be afraid to read documentation. Check my journey on LeetCode: {leetcode_url}"
}
```

---

## 🚀 Testing Your Changes

### Step 1: Update the JSON

Edit `knowledge-base-v5.json` and add your new FAQ.

### Step 2: Restart Server

```bash
# Stop server (Ctrl+C)
npm start
```

### Step 3: Test via cURL

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "your test question here"}'
```

### Step 4: Test via Frontend

Open your chat widget and try the new question!

---

## ⚠️ Common Mistakes to Avoid

### ❌ Mistake 1: JSON Syntax Error

```json
// WRONG - Missing comma
"faq1": { ... }
"faq2": { ... }

// CORRECT
"faq1": { ... },
"faq2": { ... }
```

### ❌ Mistake 2: Wrong Placeholder

```json
// WRONG
"answer": "Visit my GitHub: {github}"

// CORRECT
"answer": "Visit my GitHub: {github_url}"
```

### ❌ Mistake 3: Not Enough Question Variations

```json
// WEAK - Only 1 variation
"questions": ["github"]

// BETTER - Multiple variations
"questions": [
  "github",
  "git profile",
  "repositories",
  "code",
  "github username",
  "show github"
]
```

---

## 🎯 Best Practices

### 1. Add Multiple Question Variations

Think about how different people might ask:
- Formal: "Could you please share your GitHub profile?"
- Casual: "show me ur github"
- Typos: "what's ur githb"
- Short: "github"

### 2. Use Natural Language in Answers

```json
// ROBOTIC
"answer": "GitHub: {github_url}"

// NATURAL
"answer": "Check out my GitHub at {github_url} - I've got {repos} repos with various projects!"
```

### 3. Link Related Topics

```json
"answer": "I specialize in React and Node.js full-stack development. Want to see my projects? Just ask about my portfolio or GitHub!"
```

### 4. Keep Answers Concise

- Aim for 2-4 sentences
- Use bullet points for lists
- Include relevant links

---

## 📊 Example: Complete Addition

Let's add a comprehensive "Machine Learning" FAQ:

```json
"machine_learning": {
  "questions": [
    "machine learning",
    "ml projects",
    "ai experience",
    "data science",
    "ml skills",
    "work with ml",
    "artificial intelligence"
  ],
  "answer": "Yes! I have experience with machine learning. Key projects:\n\n• CloneCatch: ML-based plagiarism detection\n• Rainfall Prediction: Ensemble methods for weather forecasting\n\nI work with Python, scikit-learn, TensorFlow, and data analysis tools. Check the code on GitHub: {github_url}"
}
```

**What makes this good:**
✅ 7 question variations
✅ Specific examples
✅ Technical details
✅ Call-to-action (GitHub link)
✅ Natural, friendly tone

---

## 🔄 Updating Existing FAQs

### How to Edit an Answer:

1. Find the FAQ category in the JSON
2. Edit the `answer` field
3. Save and restart server

### How to Add More Questions:

```json
// BEFORE
"github": {
  "questions": ["github", "repositories"]
  ...
}

// AFTER
"github": {
  "questions": [
    "github",
    "repositories",
    "git profile",     // Added
    "code",            // Added
    "source code"      // Added
  ]
  ...
}
```

---

## 🛠️ Advanced: Dynamic Logic

### Using Conditional Text

```json
"answer": "I've solved {total} LeetCode problems. {categories ? 'Top categories: ' + categories : 'Working on various problem types!'}"
```

But for simplicity, stick to static templates and let the server handle logic.

---

## 📦 Template for Copy-Paste

```json
"your_category_name": {
  "questions": [
    "main question",
    "variation 1",
    "variation 2",
    "variation 3"
  ],
  "answer": "Your answer here. Use {placeholders} as needed. Keep it friendly and informative!"
}
```

---

## ✅ Quick Checklist

Before saving your changes:

- [ ] Valid JSON syntax (use [JSONLint](https://jsonlint.com/) to check)
- [ ] At least 3-5 question variations
- [ ] Clear, natural answer
- [ ] Relevant placeholders used correctly
- [ ] Links to relevant resources
- [ ] Tested the new FAQ

---

## 🎉 You're Ready!

You can now:
- ✅ Add new FAQs
- ✅ Update existing answers
- ✅ Use placeholders
- ✅ Test changes
- ✅ Keep the bot updated

**Remember:** The bot matches questions using simple text matching, so:
- More variations = better matching
- Keep questions lowercase
- Include common typos
- Think about different phrasings

---

## 💡 Need Help?

Common issues:

1. **Bot not responding correctly?**
   - Check JSON syntax
   - Verify question patterns
   - Restart server

2. **Placeholder not working?**
   - Check spelling
   - Use available placeholders only
   - Make sure it's in curly braces `{like_this}`

3. **Want to test without server?**
   - Use [JSONLint](https://jsonlint.com/) to validate

---

**Happy Updating!** 🚀