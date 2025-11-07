



 **CultureQuest 2.0 – Gamified Exploration of India’s Heritage**

> **CultureQuest 2.0** is an interactive, gamified web platform that helps users explore India’s rich cultural diversity through games, quizzes, and virtual exploration. It combines education and entertainment to make learning about India’s heritage more engaging and enjoyable.

---

## 🧭 **Project Overview**

**CultureQuest 2.0** allows users to virtually travel across different regions of India and learn about their **monuments, festivals, cuisines, art forms, and traditions**.
Users can attempt cultural quizzes, complete quests, and earn rewards in the form of badges and XP points.
The platform integrates **gamification**, **progress tracking**, and **leaderboards** to encourage active participation and cultural discovery.



 **Team Members**

| **Name**           | **Roll No** | **Responsibility**                                               |
| ------------------ | ----------- | ---------------------------------------------------------------- |
| Guneesh Singh      | 16010123128 | Frontend Development (React, UI Components, Tailwind Styling)    |
| Tatva Jain         | 16010123118 | Backend Development (Node.js, Express APIs, MongoDB Integration) |
| Harsh Shah         | 16010123140 | Database Design, Authentication, Progress & Badge Tracking       |
| Harshvardhan Tyagi | 16010123143 | UI/UX Design (Figma), Animations, Documentation & Presentation   |



## 🎯 **Objective**

To build a **gamified educational platform** that promotes awareness and appreciation of **India’s cultural heritage** through **interactive storytelling, quizzes, and quests**, while leveraging modern web technologies for accessibility and engagement.

---

## 🧩 **Tech Stack**

### **Frontend:**

* React.js – Component-based UI design
* Tailwind CSS – Responsive and modern styling
* Framer Motion – Smooth animations and transitions
* Axios – API communication

### **Backend:**

* Node.js – Server-side development
* Express.js – RESTful API creation and routing
* Mongoose – ODM for MongoDB integration

### **Database:**

* MongoDB Atlas (Cloud-hosted NoSQL database)

### **Tools & Platforms:**

* Figma – UI/UX Design
* Render – Deployment Platform
* GitHub – Version Control & Collaboration

---

## 🗃️ **Database Design**

The database is designed using **MongoDB Atlas**, a NoSQL document-oriented database.
It includes the following core collections:

| **Collection**  | **Attributes**                                      | **Purpose**                                 |
| --------------- | --------------------------------------------------- | ------------------------------------------- |
| **Users**       | username, email, password, points, badges, progress | Stores user info, scores, and achievements  |
| **Quizzes**     | region, topic, question, options, correctAnswer     | Contains region-based cultural quizzes      |
| **Quests**      | questTitle, description, rewardPoints, status       | Stores quest details and associated rewards |
| **Leaderboard** | username, points, rank, lastUpdated                 | Displays top performers on the platform     |

### **Data Flow:**

* **User → Quiz_Attempts → XP + Progress Update**
* **Region → Cultural_Items + Quests + Quiz_Questions**
* **Quests → Reward → Badge + XP**

This structure supports smooth user progress tracking, scalable content management, and efficient data retrieval.



 **Features Implemented**

✅ Explore India through an interactive map interface
✅ Region-wise cultural quizzes and quests
✅ Reward system with badges and XP levels
✅ Dynamic leaderboard displaying top users
✅ Secure login/signup using JWT authentication
✅ Real-time progress tracking for each user
✅ Mobile-responsive and user-friendly interface
✅ Engaging UI/UX with animations and visuals
✅ Cloud-hosted MongoDB Atlas database
✅ Dynamic content management for quizzes and regions

---

## ⚙️ **Installation & Setup**

Follow these steps to run the project locally:

### **1. Clone the repository**

```bash
git clone https://github.com/tatvajain/culturoquest-app.git
cd culturoquest-app
```

### **2. Install dependencies**

```bash
npm install
```

### **3. Setup environment variables**

Create a `.env` file in the root directory and add:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### **4. Run the application**

```bash
npm run dev
```

The app will run on **[http://localhost:3000/](http://localhost:3000/)**.

---

## 🧠 **Technical Issues Faced & Solutions**

| **Issue**                      | **Cause**                     | **Solution**                                  |
| ------------------------------ | ----------------------------- | --------------------------------------------- |
| React components not rendering | Improper prop passing         | Used proper import/export and validated props |
| MongoDB connection error       | Missing environment variables | Configured `.env` and whitelisted IP in Atlas |
| API not responding             | Wrong route structure         | Fixed routes and used async/await properly    |
| UI inconsistency               | Poor responsiveness           | Implemented Tailwind’s responsive classes     |
| State loss between components  | Missing state management      | Used `useState`, `useEffect`, and Context API |

---

 **Future Scope**

* Integration of **AR/VR** for immersive cultural experiences
* **AI-driven quiz generation** and personalized recommendations
* **Multilingual support** for wider accessibility
* **Mobile app** using React Native with offline mode
* **Collaboration with schools** for cultural education programs
* **Gamification upgrades**: streaks, daily challenges, new badges



 **Project Repository**

📂 GitHub: [https://github.com/tatvajain/culturoquest-app.git](https://github.com/tatvajain/culturoquest-app.git)
📡 Deployment: *(Add Render/Netlify link if hosted)*



 Conclusion

CultureQuest 2.0 successfully demonstrates how technology can make learning about Indian heritage interactive and engaging.
By combining **gamification, quizzes, storytelling, and modern web design**, it creates a platform that both **educates and entertains**, inspiring users to explore the cultural richness of India.



