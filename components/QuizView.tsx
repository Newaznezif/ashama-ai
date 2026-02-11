
import React, { useState } from 'react';
import { generateQuiz } from '../services/geminiService';

const QuizView: React.FC = () => {
  const [topic, setTopic] = useState('Nagaa Gaafachuu');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(false);

  const startQuiz = async () => {
    setLoading(true);
    const quizData = await generateQuiz(topic);
    setQuestions(quizData);
    setCurrentIdx(0);
    setScore(0);
    setIsFinished(false);
    setLoading(false);
  };

  const handleAnswer = (idx: number) => {
    if (idx === questions[currentIdx].answer) {
      setScore(score + 1);
    }

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
      <p className="text-gray-600 font-medium">Qorumsa kee qopheessaa jirra...</p>
    </div>
  );

  if (isFinished) return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl text-center border border-gray-100">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold mb-2">Qorumsa Xumurteetta!</h2>
      <p className="text-gray-600 mb-6">Qabxii kee: <span className="text-red-600 font-bold">{score}</span> / {questions.length}</p>
      <button 
        onClick={() => setQuestions([])}
        className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg"
      >
        Mata-duree biraa yaali
      </button>
    </div>
  );

  if (questions.length > 0) return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-bold text-red-600">Gaaffii {currentIdx + 1}/{questions.length}</span>
        <div className="w-2/3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}></div>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-8 text-gray-900 leading-snug">{questions[currentIdx].question}</h3>
      <div className="space-y-4">
        {questions[currentIdx].options.map((opt: string, i: number) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-600 transition-all group flex items-center"
          >
            <span className="inline-block w-10 h-10 rounded-lg bg-gray-100 text-gray-600 text-center leading-10 font-bold mr-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
              {String.fromCharCode(65 + i)}
            </span>
            <span className="font-medium text-gray-700">{opt}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl text-center border border-gray-100">
      <h2 className="text-3xl font-black mb-4 text-gray-900 underline decoration-red-600 underline-offset-8">Qorumsaaf Qophiidhaa?</h2>
      <p className="text-gray-600 mb-8 mt-4">Beekumsa kee qoruuf mata-duree tokko filadhu.</p>
      <select 
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="w-full p-4 mb-8 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none font-medium bg-gray-50"
      >
        <option>Nagaa Gaafachuu</option>
        <option>Sirna Gadaa</option>
        <option>Seera Afaanii</option>
        <option>Jechoota Guyyaa Guyyaa</option>
        <option>Seenaa Oromiyaa</option>
      </select>
      <button 
        onClick={startQuiz}
        className="w-full py-5 bg-red-600 text-white rounded-xl font-black text-lg hover:bg-red-700 transition-all shadow-xl active:scale-95"
      >
        Qorumsa Jalqabi
      </button>
    </div>
  );
};

export default QuizView;
