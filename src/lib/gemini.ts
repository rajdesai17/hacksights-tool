import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Define a conversion rate (you can replace this with a dynamic API call if needed)
const USD_TO_INR_CONVERSION_RATE = 82.5; // Example rate, update as needed

export async function extractHackathonDetails(url: string) {
  try {
    // First fetch the webpage content
    const response = await fetch(url);
    const html = await response.text();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Here is the HTML content of a hackathon webpage. Please extract the hackathon details:
    
    ${html}

    Extract ONLY the following details in a strict JSON format:
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
      "venue": "actual venue or Not Available",
      "startDate": "actual start date or Not Available",
      "endDate": "actual end date or Not Available", 
      "registrationDeadline": "actual deadline or Not Available",
      "teamSize": "actual team size or Not Available",
      "prizePool": "actual prize amount or Not Available",
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

    // Validate required fields
    const requiredFields = ['name', 'mode', 'startDate', 'endDate', 'registrationDeadline', 'teamSize', 'prizePool'];
    const missingFields = requiredFields.filter(field => !data[field] || data[field] === "Not Available");
    
    if (missingFields.length > 0) {
      console.warn(`Missing fields: ${missingFields.join(', ')}`);
    }

    // Convert prize pool to INR if it's in USD
    if (data.prizePool.includes('$')) {
      const prizeInUSD = parseFloat(data.prizePool.replace('$', '').trim());
      const prizeInINR = Math.round(prizeInUSD * USD_TO_INR_CONVERSION_RATE);
      data.prizePool = `₹${prizeInINR} (converted from $${prizeInUSD})`;
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
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Unable to access the URL. Please check if the URL is valid and accessible.'
      };
    }
    return {
      success: false,
      error: 'Failed to extract hackathon details. Please ensure the URL is a valid hackathon page.'
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