import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Define a conversion rate (you can replace this with a dynamic API call if needed)
const USD_TO_INR_CONVERSION_RATE = 82.5; // Example rate, update as needed

export async function extractHackathonDetails(url: string) {
  try {
    // Pass URL directly to Gemini instead of fetching and parsing HTML
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Visit this hackathon URL: ${url}

    Extract the hackathon details and organize them in a strict JSON format with the following fields:
    - Hackathon name (from the page title or main heading)
    - Mode (Online/Offline) - look for location/venue information
    - Venue (if offline)
    - Start date (in DD/MM/YYYY format)
    - End date (in DD/MM/YYYY format)
    - Registration deadline (in DD/MM/YYYY format)
    - Team size (number of allowed members)
    - Prize pool (total prize amount in USD or INR)
    - Whether PPT submission is required (look for submission requirements)

    If any field is missing, use "Not Available" as the value.

    Return ONLY a valid JSON with no additional text or explanations:
    {
      "name": "actual name",
      "mode": "Online or Offline",
      "venue": "actual venue or null",
      "startDate": "actual start date in DD/MM/YYYY format",
      "endDate": "actual end date in DD/MM/YYYY format", 
      "registrationDeadline": "actual deadline in DD/MM/YYYY format",
      "teamSize": "actual team size (e.g., '1-4')",
      "prizePool": "actual prize amount",
      "pptRequired": true or false
    }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract valid JSON from the response');
    }
    
    const data = JSON.parse(jsonMatch[0]);

    // Handle default values for required fields
    Object.keys(data).forEach(key => {
      if (!data[key] && data[key] !== false) {
        data[key] = "Not Available";
      }
    });

    // Convert prize pool to INR if it's in USD
    if (data.prizePool && data.prizePool.includes('$')) {
      const prizeInUSD = parseFloat(data.prizePool.replace(/[^\d.]/g, ''));
      if (!isNaN(prizeInUSD)) {
        const prizeInINR = Math.round(prizeInUSD * USD_TO_INR_CONVERSION_RATE);
        data.prizePool = `₹${prizeInINR} (converted from $${prizeInUSD})`;
      }
    }

    return {
      success: true,
      data: {
        ...data,
        url // Include the original URL
      }
    };

  } catch (error) {
    console.error('Error extracting hackathon details:', error);
    return {
      success: false,
      error: 'Failed to extract hackathon details. Please ensure the URL is a valid hackathon page and try again.'
    };
  }
}

export async function listAvailableModels() {
  try {
    const models = await genAI.listModels();
    console.log('Available models:', models);
    return models;
  } catch (error) {
    console.error('Error listing models:', error);
    throw error;
  }
}