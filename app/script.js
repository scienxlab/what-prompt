// Function to construct the prompt based on user inputs
function getGoals() {
    const persona = $('#persona').val();
    const role = $('#role').val();
    const style = $('#style').val();
    const task = $('#task').val();
    const format = $('#format').val();
  
    return [persona, role, style, task, format];
  }
  
  // Function to generate a random value from a list
  function getRandomValue(list) {
    return list[Math.floor(Math.random() * list.length)];
  }
  
// Function to generate the goal prompt data
function generateGoals() {
  const personas = ["5 year-old", "Python programmer", "CEO", "musician"];
  const roles = ["teacher", "politician", "journalist", "lawyer"];
  const styles = ["formal", "poetic", "informal", "street"];
  const tasks = ["Summarize", "Improve", "Expand", "Tabulate"];
  const formats = ["text", "markdown", "json", "emoji"];

  const persona = getRandomValue(personas);
  const role = getRandomValue(roles);
  const style = getRandomValue(styles);
  const task = getRandomValue(tasks);
  const format = getRandomValue(formats);

  // Return an array of the selected values
  return [persona, role, style, task, format];
}

// Function to construct the prompt from the array of values
function constructPrompt(values) {
  const [persona, role, style, task, format] = values;

  return `I am a ${persona}. Act as a ${role}. Use a ${style} style. ${task} the text above especially for me. Produce output in ${format} format.`;
}

// Function to compare two arrays element-wise and construct a string with checkmarks for matching pairs
function constructCheckmarks(arr1, arr2) {
  // Ensure both arrays have the same length
  if (arr1.length !== arr2.length) {
      throw new Error("Arrays must have the same length");
  }

  let checkmarks = "";
  for (let i = 0; i < arr1.length; i++) {
      // Compare elements at the same index in both arrays
      if (arr1[i] === arr2[i]) {
          // If elements match, add a checkmark
          checkmarks += " ✅";
      } else {
          // If elements don't match, add nothing
          checkmarks += "";
      }
  }
  return checkmarks;
}

  // Function to toggle the bubble content visibility
  function toggleBubble() {
    var bubbleContent = document.getElementById('bubbleContent');
    bubbleContent.style.display = bubbleContent.style.display === 'block' ? 'none' : 'block';
  }

  // Function to close the bubble content
  function closeBubble() {
    var bubbleContent = document.getElementById('bubbleContent');
    bubbleContent.style.display = 'none';
  }

// Function to show spinner
function showSpinner(spinnerId) {
    $(spinnerId).removeClass('d-none');
}

// Function to hide spinner
function hideSpinner(spinnerId) {
    $(spinnerId).addClass('d-none');
}

function readAPIKey() {
  var apiKey = document.getElementById('secretKey').value;
}

// Function to send a prompt to the OpenAI API
async function sendPromptToAPI(prompt, spinnerId) {
  showSpinner(spinnerId);

  const apiKey = API_KEY;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{"role": "user", "content": prompt}],
      max_tokens: 256,
      temperature: 0.0
    })
  });

  try {
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    hideSpinner(spinnerId);
  }
}

let attemptsRemaining = 10;
let goalPrompt;

$(document).ready(async function() {
  // Generate the goal prompt and send it to the API

    // Array of texts
    const topics = [
      "Generative AI",
      "Artificial intelligence",
      "Machine learning",
      "Norway",
      "Equinor",
      "Renewable energy",
      "Carbon sequestration",
      "Offshore wind energy",
  ];

  // Set the textarea content to a random text from the array
  const topic = getRandomValue(topics);
  const context = await sendPromptToAPI(`Please write a three-sentence paragraph on ${topic}`, '#contextSpinner');
  $('#context').html(context);

  const goals = generateGoals();
  const goalPrompt = constructPrompt(goals);
  $('#goalPrompt').text(goalPrompt.replaceAll(' ', '-'));
  const goalResponse = await sendPromptToAPI(`Context: ${context}\n\n${goalPrompt}`, '#goalSpinner');
  $('#goalResponse').text(goalResponse);

  // Generate and send the prompt when the button is clicked
  $('#submitPrompt').on('click', async function() {

    if (attemptsRemaining > 0) {
      // const context = $('#context').html();
      const userGoals = getGoals();
      const prompt = constructPrompt(userGoals);
      const userResponse = await sendPromptToAPI(`Context: ${context}\n\n${prompt}`, '#responseSpinner');

      $('#response').text(userResponse);

      const checkmarks = constructCheckmarks(userGoals, goals);
      $('#checkmarks').text(checkmarks);

      attemptsRemaining--;
      $('#attemptsRemaining').text(attemptsRemaining);
      
      document.getElementById('playAgain').addEventListener('click', function() {
        location.reload();
      });
      
      // Show the modal when the game is won
      if (prompt === goalPrompt) {
        $('#winModal').modal('show');
      } else if (attemptsRemaining === 0) {
        alert('Game over! You have used all your attempts.');
      }
    }
  });

  $('#revealGoalPrompt').on('click', function() {
    var currentText = $('#goalPrompt').text();
    if ($('#goalPrompt').hasClass('blurred')) {
      $('#goalPrompt').text(currentText.replace(/-/g, ' '));
      $('#goalPrompt').removeClass('blurred');
      $(this).text('Hide Goal Prompt');
    } else {
      $('#goalPrompt').text(currentText.replace(/ /g, '-'));
      $('#goalPrompt').addClass('blurred');
      $(this).text('Reveal Goal Prompt');
    }
  });

});
