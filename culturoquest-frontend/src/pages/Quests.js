import React, { useState } from "react";
import { Link } from "react-router-dom";
// Import all game components
import TimelineJigsaw from "../components/games/TimelineJigsaw";
import RiddleOfTheSages from "../components/games/RiddleOfTheSages";
import CulturalMatchUp from "../components/games/CulturalMatchUp";
import LegacyLineup from "../components/games/LegacyLineup";
import ArtisansEye from "../components/games/ArtisansEye";
import FactOrFiction from "../components/games/FactOrFiction";

// A simple placeholder array for our quests, grouped by saga
const sagas = {
    "The Mauryan Empire": [
        { id: 'timelineJigsaw', title: 'Timeline Jigsaw', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { id: 'riddleOfTheSages', title: 'Riddle of the Sages', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { id: 'legacyLineup', title: 'Legacy Lineup', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> },
    ],
    "Indian Culture 101": [
        { id: 'culturalMatchUp', title: 'Cultural Match-Up', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
        { id: 'artisansEye', title: 'Artisan\'s Eye', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> },
        { id: 'factOrFiction', title: 'Fact or Fiction', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    ]
};

const QuestItem = ({ icon, title, saga, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center justify-between w-full p-4 text-left transition-all duration-300 ease-in-out bg-slate-100 rounded-lg border border-slate-200 enabled:hover:border-teal-400 enabled:hover:bg-white enabled:hover:scale-105"
    >
        <div className="flex items-center">
            <div className="mr-4 text-teal-500">{icon}</div>
            <div>
                <h4 className="font-bold text-slate-800">{title}</h4>
                <p className="text-sm text-slate-500">{saga}</p>
            </div>
        </div>
        <div className="text-right">
            <p className="font-bold text-green-600">+150 QP</p>
        </div>
    </button>
);

export default function Quests() {
  const [activeGame, setActiveGame] = useState(null);

  const handleGameComplete = () => setActiveGame(null);
  
  // Game launching logic
  if (activeGame === "timelineJigsaw") return <TimelineJigsaw onGameComplete={handleGameComplete} />;
  if (activeGame === "riddleOfTheSages") return <RiddleOfTheSages onGameComplete={handleGameComplete} />;
  if (activeGame === "legacyLineup") return <LegacyLineup onGameComplete={handleGameComplete} />;
  if (activeGame === "culturalMatchUp") return <CulturalMatchUp onGameComplete={handleGameComplete} />;
  if (activeGame === "artisansEye") return <ArtisansEye onGameComplete={handleGameComplete} />;
  if (activeGame === "factOrFiction") return <FactOrFiction onGameComplete={handleGameComplete} />;
  
  return (
    <section>
      <div className="text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Available Quests 🗺️</h2>
        <p className="mt-2 text-lg text-slate-600">Select a quest to test your knowledge and earn Quest Points!</p>
      </div>
      
      <div className="mt-8 max-w-4xl mx-auto space-y-8">
        {Object.entries(sagas).map(([sagaName, quests]) => (
            <div key={sagaName} className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-800">{sagaName}</h3>
                    <Link to="/explore" className="px-4 py-2 text-sm font-semibold text-teal-600 bg-teal-50 rounded-full hover:bg-teal-100 transition">
                        View on Map
                    </Link>
                </div>
                <div className="mt-4 space-y-4">
                    {quests.map(quest => (
                        <QuestItem 
                            key={quest.id}
                            icon={quest.icon}
                            title={quest.title}
                            saga={sagaName}
                            onClick={() => setActiveGame(quest.id)}
                        />
                    ))}
                </div>
            </div>
        ))}
      </div>
    </section>
  );
}

