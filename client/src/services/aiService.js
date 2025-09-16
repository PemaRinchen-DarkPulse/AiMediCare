/**
 * AI Service for OpenAI API integrations and AI-powered triage
 */

// Function to generate pre-visit triage questions using the new AI backend
export const generateTriageQuestions = async (reason, additionalNotes, useAI = true, language = 'en') => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch('http://localhost:5000/api/triage/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        appointmentReason: reason,
        additionalNotes: additionalNotes,
        language: language,
        useAI: useAI,
        maxQuestions: 5
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Backend API error:', error);
      throw new Error(error.message || 'Failed to generate questions');
    }

    const data = await response.json();
    return {
      questions: data.data.questions || [],
      metadata: data.data.metadata || {}
    };
  } catch (error) {
    console.error('Error generating triage questions:', error);
    throw error;
  }
};

// Function to analyze appointment reason using AI
export const analyzeAppointmentReason = async (reason, notes = '') => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch('http://localhost:5000/api/triage/analyze-reason', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        reason: reason,
        notes: notes
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Analysis API error:', error);
      throw new Error(error.message || 'Failed to analyze appointment reason');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error analyzing appointment reason:', error);
    throw error;
  }
};

// Function to check AI service health
export const checkAIServiceHealth = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch('http://localhost:5000/api/triage/ai/health', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to check AI service health');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error checking AI service health:', error);
    throw error;
  }
};

// Function to get supported languages
export const getSupportedLanguages = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch('http://localhost:5000/api/triage/ai/languages', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get supported languages');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting supported languages:', error);
    // Return fallback languages
    return {
      supported_languages: [
        { code: 'en', name: 'English' },
        { code: 'dz', name: 'Dzongkha' }
      ],
      default_language: 'en'
    };
  }
};

// Legacy function - kept for backward compatibility with direct OpenAI API
export const generateTriageQuestionsLegacy = async (reason, additionalNotes) => {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const baseUrl = import.meta.env.VITE_OPENAI_BASE_URL;
    const model = import.meta.env.VITE_OPENAI_MODEL;

    if (!apiKey) {
      console.error('OpenAI API key not found in environment variables');
      throw new Error('API configuration missing');
    }

    const prompt = `
      Based on the patient's appointment reason and additional notes, generate a detailed pre-visit triage 
      questionnaire to help the healthcare provider better understand the patient's condition before the visit.
      
      Format the questions in a structured JSON format that includes:
      1. Multiple choice questions with options
      2. Severity scale questions (1-10)
      3. Yes/No questions
      4. Text entry questions for additional details
      
      Patient's reason for visit: ${reason}
      Additional notes: ${additionalNotes || 'None provided'}
      
      Return ONLY the JSON array of questions without any explanations or introductions. The JSON should have this structure:
      [
        {
          "id": "q1",
          "type": "multiple_choice",
          "question": "Question text here?",
          "options": ["Option 1", "Option 2", "Option 3"],
          "required": true
        },
        {
          "id": "q2",
          "type": "severity_scale",
          "question": "On a scale of 1-10, how severe is your pain?",
          "min": 1,
          "max": 10,
          "minLabel": "Mild",
          "maxLabel": "Severe",
          "required": true
        },
        {
          "id": "q3", 
          "type": "yes_no",
          "question": "Have you experienced this before?",
          "required": false
        },
        {
          "id": "q4",
          "type": "text",
          "question": "Please describe any additional symptoms:",
          "required": false
        },
        ...
      ]
    `;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a medical AI assistant that helps generate appropriate pre-visit triage questions based on a patient's appointment reason."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate questions');
    }

    const data = await response.json();
    const generatedContent = data.choices[0]?.message?.content || '';

    // Extract JSON from the response
    try {
      // Find JSON content if wrapped in backticks
      const jsonMatch = generatedContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                         generatedContent.match(/```\s*([\s\S]*?)\s*```/) ||
                         [null, generatedContent];
      
      const jsonContent = jsonMatch[1].trim();
      const questions = JSON.parse(jsonContent);
      return questions;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw AI response:', generatedContent);
      throw new Error('Invalid question format received');
    }
  } catch (error) {
    console.error('Error generating triage questions:', error);
    throw error;
  }
};

// Function to save generated questions to the database
export const saveTriageQuestions = async (appointmentId, questions) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/triage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ questions })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save triage questions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving triage questions:', error);
    throw error;
  }
};

// Function to send a message to the chatbot and get a response
export const sendChatMessage = async (message, history = []) => {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const baseUrl = import.meta.env.VITE_OPENAI_BASE_URL;
    const model = import.meta.env.VITE_OPENAI_MODEL;

    if (!apiKey) {
      console.error('OpenAI API key not found in environment variables');
      throw new Error('API configuration missing');
    }

    // Convert chat history to the format expected by OpenAI
    const messages = [
      {
        role: "system",
        content: "You are a helpful healthcare assistant for AiMediCare, a telehealth platform. Provide concise, helpful information about medical topics, healthcare services, and how to use the platform. Do not diagnose or prescribe, but guide users appropriately. If asked about emergency situations, always advise seeking immediate medical attention."
      },
      ...history.map(chat => ({
        role: chat.sender.toLowerCase() === 'you' ? "user" : "assistant",
        content: chat.message
      })),
      { role: "user", content: message }
    ];

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4086
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get chatbot response');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error in chatbot communication:', error);
    throw error;
  }
};