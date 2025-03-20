import React from 'react';

export default function BrainInfographic() {
  return (
    <div className="relative max-w-5xl mx-auto mb-16">
      {/* Assessment Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div className="relative bg-white p-6 rounded-xl shadow text-center transform transition-transform hover:scale-105">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8V12L14.5 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Fast Assessment</h3>
          <p className="text-sm text-gray-600">Complete the full assessment in under 30 minutes</p>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-600 font-bold text-xs">1</div>
        </div>
        
        <div className="relative bg-white p-6 rounded-xl shadow text-center transform transition-transform hover:scale-105">
          <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-purple-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 3L9 7M15 3L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Scientific Accuracy</h3>
          <p className="text-sm text-gray-600">Based on established cognitive science research methods</p>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-purple-600 font-bold text-xs">2</div>
        </div>
        
        <div className="relative bg-white p-6 rounded-xl shadow text-center transform transition-transform hover:scale-105">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 15V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 11L12 15L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 3L12 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Instant Results</h3>
          <p className="text-sm text-gray-600">Get detailed cognitive profile and recommendations</p>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-green-600 font-bold text-xs">3</div>
        </div>
      </div>
      
      {/* Modern Brain Visualization */}
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Complete Brain Assessment</h3>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Modern Brain Visualization */}
          <div className="relative w-72 h-64">
            {/* Brain outline with gradient */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="280" height="240" viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Brain shape with gradient fill */}
                <path 
                  d="M140,30 C210,30 240,90 240,120 C240,150 210,210 140,210 C70,210 40,150 40,120 C40,90 70,30 140,30 Z" 
                  fill="url(#brainGradient)" 
                  opacity="0.1"
                />
                
                {/* Memory region - frontal lobe */}
                <g className="transition-all duration-500 hover:scale-110 cursor-pointer">
                  <path 
                    d="M100,70 Q120,40 140,50 Q160,60 160,90 Q150,110 130,100 Q110,90 100,70 Z" 
                    fill="#3B82F6" 
                    fillOpacity="0.7" 
                    stroke="#3B82F6" 
                    strokeWidth="1.5"
                  />
                  <text x="130" y="80" fill="white" fontSize="12" fontWeight="600" textAnchor="middle">Memory</text>
                </g>
                
                {/* Problem Solving - prefrontal region */}
                <g className="transition-all duration-500 hover:scale-110 cursor-pointer">
                  <path 
                    d="M180,70 Q200,40 220,50 Q240,70 220,100 Q200,110 180,90 Z" 
                    fill="#10B981" 
                    fillOpacity="0.7" 
                    stroke="#10B981" 
                    strokeWidth="1.5"
                  />
                  <text x="200" y="75" fill="white" fontSize="12" fontWeight="600" textAnchor="middle">Problem</text>
                  <text x="200" y="90" fill="white" fontSize="12" fontWeight="600" textAnchor="middle">Solving</text>
                </g>
                
                {/* Focus - central region */}
                <g className="transition-all duration-500 hover:scale-110 cursor-pointer">
                  <path 
                    d="M140,110 Q160,100 170,120 Q160,140 140,150 Q120,140 110,120 Q120,100 140,110 Z" 
                    fill="#A855F7" 
                    fillOpacity="0.7" 
                    stroke="#A855F7" 
                    strokeWidth="1.5"
                  />
                  <text x="140" y="130" fill="white" fontSize="12" fontWeight="600" textAnchor="middle">Focus</text>
                </g>
                
                {/* Cognitive Flexibility - temporal region */}
                <g className="transition-all duration-500 hover:scale-110 cursor-pointer">
                  <path 
                    d="M80,120 Q100,100 110,130 Q100,160 70,150 Q60,130 80,120 Z" 
                    fill="#F59E0B" 
                    fillOpacity="0.7" 
                    stroke="#F59E0B" 
                    strokeWidth="1.5"
                  />
                  <text x="85" y="130" fill="white" fontSize="10" fontWeight="600" textAnchor="middle">Cognitive</text>
                  <text x="85" y="145" fill="white" fontSize="10" fontWeight="600" textAnchor="middle">Flexibility</text>
                </g>
                
                {/* Spatial Reasoning - parietal region */}
                <g className="transition-all duration-500 hover:scale-110 cursor-pointer">
                  <path 
                    d="M200,130 Q220,110 240,130 Q250,150 230,170 Q210,180 190,160 Q190,140 200,130 Z" 
                    fill="#EC4899" 
                    fillOpacity="0.7" 
                    stroke="#EC4899" 
                    strokeWidth="1.5"
                  />
                  <text x="215" y="140" fill="white" fontSize="10" fontWeight="600" textAnchor="middle">Spatial</text>
                  <text x="215" y="155" fill="white" fontSize="10" fontWeight="600" textAnchor="middle">Reasoning</text>
                </g>
                
                {/* Neural connections */}
                <path 
                  d="M120,85 Q130,100 140,130 M160,85 Q150,100 140,130 M90,130 Q115,140 140,130 M190,130 Q165,140 140,130" 
                  stroke="rgba(99, 102, 241, 0.6)" 
                  strokeWidth="1.5" 
                  strokeDasharray="3,3"
                />
                
                {/* Gradient definition */}
              <defs>
                <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              </svg>
            </div>
          </div>
          
          {/* Assessment Details */}
          <div className="max-w-md">
            <div className="space-y-4">
              <div className="flex items-start hover:bg-blue-50 p-2 rounded-lg transition-colors">
                <div className="w-4 h-4 rounded-full bg-blue-500 mt-1 mr-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Memory</h4>
                  <p className="text-gray-700 text-sm">Short-term and working memory capacity. Ability to recall information after delays.</p>
                </div>
              </div>
              
              <div className="flex items-start hover:bg-green-50 p-2 rounded-lg transition-colors">
                <div className="w-4 h-4 rounded-full bg-green-500 mt-1 mr-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Problem Solving</h4>
                  <p className="text-gray-700 text-sm">Critical thinking and solution finding under time constraints and varying difficulty levels.</p>
                </div>
              </div>
              
              <div className="flex items-start hover:bg-purple-50 p-2 rounded-lg transition-colors">
                <div className="w-4 h-4 rounded-full bg-purple-500 mt-1 mr-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Focus</h4>
                  <p className="text-gray-700 text-sm">Attention span and concentration abilities when faced with distractions or competing stimuli.</p>
                </div>
          </div>
          
              <div className="flex items-start hover:bg-amber-50 p-2 rounded-lg transition-colors">
                <div className="w-4 h-4 rounded-full bg-amber-500 mt-1 mr-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Cognitive Flexibility</h4>
                  <p className="text-gray-700 text-sm">Adaptability to changing rules and circumstances, shifting between concepts or tasks.</p>
              </div>
              </div>
              
              <div className="flex items-start hover:bg-pink-50 p-2 rounded-lg transition-colors">
                <div className="w-4 h-4 rounded-full bg-pink-500 mt-1 mr-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Spatial Reasoning</h4>
                  <p className="text-gray-700 text-sm">Visualizing and manipulating objects mentally, understanding spatial relationships.</p>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
