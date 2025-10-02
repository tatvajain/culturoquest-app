import React from "react";

export default function About() {
  return (
    <section className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold">Our Mission</h2>
        <p className="mt-2 text-lg text-slate-600 italic">"Where Learning Meets Legacy"</p>
      </div>
      <div className="bg-white p-8 rounded-lg border border-slate-200 space-y-6 text-lg text-slate-700 leading-relaxed">
        <p>
          <span className="font-bold text-2xl text-indigo-700 float-left mr-3">C</span>ulturoQuest was born from a simple idea: learning about history and culture shouldn't be a passive activity limited to textbooks. It should be an active, engaging, and thrilling adventure. Our mission is to transform the rich, complex tapestry of Indian heritage into an interactive journey of discovery.
        </p>
        <p>
          We believe that by gamifying the learning process—through challenges, rewards, and storytelling—we can ignite a lifelong passion for history in students and enthusiasts alike. Every quest you undertake, every artifact you identify, and every timeline you master is a step closer to truly connecting with the legacy of the past.
        </p>
        <hr className="my-6 border-slate-200" />
        <h3 className="text-2xl font-bold">The Technology</h3>
        <p>
          This platform is built with a modern, frontend-first architecture using React and Tailwind CSS, all powered by data from carefully curated JSON files. The lightweight Node.js backend exists purely to track your personal journey—your progress, points, and achievements.
        </p>
      </div>
    </section>
  );
}