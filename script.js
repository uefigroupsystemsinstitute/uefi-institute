document.addEventListener('DOMContentLoaded', () => {
    const synth = window.speechSynthesis;
    let lectureStep = 0; 

    const micBtn = document.getElementById('mic-toggle');
    const statusText = document.getElementById('status-text');
    const userInput = document.getElementById('user-input');
    const pulse = document.getElementById('prof-pulse-indicator');

    // --- ENHANCED HUMAN-LIKE VOICE ENGINE ---
    function speak(text) {
        synth.cancel();
        
        // Split text into sentences for better natural pausing
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        
        sentences.forEach((sentence, index) => {
            const utter = new SpeechSynthesisUtterance(sentence.trim());
            
            // Get all available voices
            const voices = synth.getVoices();
            
            /* PRIORITY VOICES (Professional & Deep):
               1. Google UK English Male (Best for Web)
               2. Apple Daniel (Classic Professor)
               3. Microsoft Ryan (Natural)
            */
            const preferredVoice = voices.find(v => v.name.includes("Google UK English Male")) || 
                                   voices.find(v => v.name.includes("Daniel")) ||
                                   voices.find(v => v.name.includes("Male") && v.lang.includes("en-GB")) ||
                                   voices[0];

            utter.voice = preferredVoice;
            
            // Humanizing the cadence
            utter.pitch = 0.9;  // Slightly deeper for authority
            utter.rate = 0.88;   // Slower, more deliberate professional pace
            utter.volume = 1;

            utter.onstart = () => { 
                pulse.classList.add('speaking'); 
                statusText.innerText = "PROFESSOR SPEAKING..."; 
            };

            utter.onend = () => { 
                if (index === sentences.length - 1) {
                    pulse.classList.remove('speaking'); 
                    statusText.innerText = "PROFESSOR LISTENING..."; 
                }
            };
            
            synth.speak(utter);
        });
    }

    // --- ACADEMIC RESPONSE LOGIC ---
    function runLectureFlow(studentInput = "") {
        const input = studentInput.toLowerCase();

        if (lectureStep === 0) {
            // "Hmm" adds a human touch
            speak("Welcome to the lab. I've been reviewing the latest data on Neural Architecture Search. Shall we begin the lecture, or do you have a specific question first?");
            lectureStep = 1;
        } 
        else if (lectureStep === 1 && (input.includes("begin") || input.includes("start") || input.includes("ready") || input.includes("yes"))) {
            lectureStep = 2;
            teachPaper();
        }
        else if (lectureStep === 3 || (lectureStep === 1 && input.length > 3)) {
            generateAIResponse(studentInput);
        }
    }

    function teachPaper() {
        const lecture = [
            "Very well. Let's look at section one. Neural Architecture Search essentially removes the human bias from model design.",
            "In essence, we are using compute power to discover structures that a human brain might never conceptualize.",
            "If you look at the abstract on your left, you'll see the goal is 'Sovereign AI'. This refers to a recursive loop of self-improvement.",
            "I'll pause here. Does that concept of recursive improvement make sense to you, or should I clarify the search strategy?"
        ];

        let delay = 0;
        lecture.forEach((segment, index) => {
            setTimeout(() => {
                speak(segment);
                if (index === lecture.length - 1) lectureStep = 3;
            }, delay);
            // Calculate delay based on word count for more natural timing
            delay += (segment.split(' ').length * 650); 
        });
    }

    function generateAIResponse(text) {
        if (!text) return;
        
        // Adding professional conversational bridges
        const bridges = [
            "That's an insightful observation. ",
            "An interesting point. ",
            "To answer that accurately, we must consider that ",
            "Actually, if we look at the data, "
        ];
        const randomBridge = bridges[Math.floor(Math.random() * bridges.length)];
        
        let response = randomBridge + "In the context of automated deep learning, your question touches on the balance between accuracy and latency. Would you like to see the efficiency metrics?";
        speak(response);
    }

    // --- VOICE RECOGNITION (STUDENT MIC) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';

        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            userInput.value = transcript;
            runLectureFlow(transcript);
        };

        micBtn.addEventListener('click', () => {
            recognition.start();
            statusText.innerText = "LISTENING...";
        });
    }

    // Handle Text Input (Enter Key)
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            runLectureFlow(userInput.value);
            userInput.value = "";
        }
    });

    // Start on first click
    document.body.addEventListener('click', () => {
        if (lectureStep === 0) {
            // Need a slight delay to let voices load
            setTimeout(() => runLectureFlow(), 500);
        }
    }, { once: true });
});
// TERMINAL LOGIC
const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.getElementById('terminal-output');
const terminalContainer = document.getElementById('terminal-container');
const toggleIcon = document.getElementById('terminal-toggle-icon');

function toggleTerminal() {
    terminalContainer.classList.toggle('terminal-minimized');
    toggleIcon.innerText = terminalContainer.classList.contains('terminal-minimized') ? '[ + ]' : '[ - ]';
    if (!terminalContainer.classList.contains('terminal-minimized')) {
        terminalInput.focus();
    }
}

terminalInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const command = terminalInput.value.toLowerCase().trim();
        printToTerminal(`root@uefi:~$ ${command}`);
        
        // Execute Commands
        if (command === 'help') {
            printToTerminal("Available commands: <br> - 'boot quant': Load trading modules <br> - 'boot neural': Load AI modules <br> - 'clear': Clear terminal");
        } else if (command === 'boot quant') {
            printToTerminal("Loading linear algebra vectors... <span style='color: #D4AF37;'>[SUCCESS]</span>");
        } else if (command === 'boot neural') {
            printToTerminal("Allocating H100 resources... <span style='color: #D4AF37;'>[SUCCESS]</span>");
        } else if (command === 'clear') {
            terminalOutput.innerHTML = '';
        } else if (command !== '') {
            printToTerminal(`Command not recognized: ${command}. Type 'help' for options.`);
        }
        
        terminalInput.value = '';
        terminalOutput.scrollTop = terminalOutput.scrollHeight; // Scroll to bottom
    }
});

function printToTerminal(text) {
    const p = document.createElement('p');
    p.innerHTML = text;
    terminalOutput.appendChild(p);
}









function sendEmailDirectly(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullname-field').value;
    const email = document.getElementById('email-field').value;
    const location = document.getElementsByName('Location')[0].value;
    const track = document.getElementsByName('Track')[0].value;
    const vision = document.getElementsByName('Vision')[0].value;
    
    const subject = encodeURIComponent("GLOBAL ADMISSION: UEFI 2026");
    const body = encodeURIComponent(
        `Full Name: ${fullName}\n` +
        `Professional Email: ${email}\n` +
        `Origin / Residency: ${location}\n` +
        `Academy Track: ${track}\n` +
        `Statement of Intent: ${vision}`
    );
    
    // Opens a secure, browser-approved window straight to Gmail/email client
    window.location.href = `mailto:PUT YOUR EMAIL ADDRESS HERE?subject=${subject}&body=${body}`;
}
