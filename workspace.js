/**
 * UEFI Engine Core Ecosystem
 * Handles Interactive Workspace Engines across all templates
 */

window.UEFI_Engine = {
    bootUp: function(config) {
        this.config = config;
        this.renderGudaNotice();
        this.renderTimer();
        this.renderMediaView();
        this.renderSoloRevealControls();
        this.mountDesmosCalculator();
        this.mountRichNotePad();
    },

    renderGudaNotice: function() {
        const box = document.getElementById('gudaNoticeBox');
        if (this.config.module === 'Question Bank') {
            box.innerHTML = `
                <div style="background:#FFF9E6; border-left:4px solid #F59E0B; padding:15px; border-radius:6px; margin-bottom:20px;">
                    <strong style="color:#B45309;"><i class="fas fa-exclamation-triangle"></i> Guda Notice!</strong>
                    <p style="margin:5px 0 0 0; font-size:0.9rem; color:#78350F; line-height:1.4;">
                        Before getting into the QuestionBank, it is advisable to have a timer for exam-like conditions. 
                        You can set a timer for a question once you've seen its marks. The normal time for exams is 2 hours. 
                        Have your timer set and select the time which once elapsed you cannot edit the answer space anymore!
                    </p>
                </div>`;
        } else {
            box.innerHTML = '';
        }
    },

    renderTimer: function() {
        const container = document.getElementById('timerInterfaceContainer');
        if (this.config.module === 'Question Bank') {
            container.innerHTML = `
                <div style="background:#F1F5F9; padding:15px; border-radius:8px; display:flex; align-items:center; justify-content:between; gap:15px;">
                    <div>
                        <span style="font-weight:700; font-size:0.9rem; color:#475569;">3D UEFI System Engine Timer Target:</span>
                        <select id="uefiTimerDurationSet" style="padding:6px; border-radius:4px; margin-left:10px;">
                            <option value="5">5 Minutes Demo</option>
                            <option value="30">30 Minutes Pack</option>
                            <option value="60">1 Hour Sprint</option>
                            <option value="120" selected>2 Hours Exam Standard</option>
                        </select>
                    </div>
                    <button onclick="window.UEFI_Engine.startTimerEngine()" style="background:#10B981; color:#fff; border:none; padding:8px 16px; border-radius:4px; font-weight:700; cursor:pointer;">Initialize Engine</button>
                    <div id="uefiTimerDisplayNode" style="font-family:monospace; font-size:1.4rem; font-weight:700; margin-left:auto; color:#EF4444;">--:--:--</div>
                </div>`;
        } else {
            container.innerHTML = '';
        }
    },

    startTimerEngine: function() {
        const durationSelect = document.getElementById('uefiTimerDurationSet');
        let timeRemaining = parseInt(durationSelect.value) * 60;
        const display = document.getElementById('uefiTimerDisplayNode');
        
        if(this.intervalEngineInstance) clearInterval(this.intervalEngineInstance);

        this.intervalEngineInstance = setInterval(() => {
            let hours = Math.floor(timeRemaining / 3600);
            let minutes = Math.floor((timeRemaining % 3600) / 60);
            let seconds = timeRemaining % 60;

            display.textContent = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
            
            if(timeRemaining <= 0) {
                clearInterval(this.intervalEngineInstance);
                display.textContent = "WORKSPACE LOCKED";
                const pad = document.getElementById('uefiRichNotePadEditorNode');
                if(pad) {
                    pad.removeAttribute('contenteditable');
                    pad.style.background = '#F1F5F9';
                }
                alert("Runtime window elapsed. UEFI Security Framework has verified and locked the current solution block.");
            }
            timeRemaining--;
        }, 1000);
    },

    renderMediaView: function() {
        const container = document.getElementById('mediaRenderContainer');
        if (this.config.module === 'Study Videos') {
            container.innerHTML = this.config.videoEmbed;
        } else {
            // Renders embed viewer for core PDF links
            container.innerHTML = `<iframe id="uefiPdfFrameTarget" src="${this.config.pdfUrl}#toolbar=0"></iframe>`;
        }
    },

    renderSoloRevealControls: function() {
        const container = document.getElementById('soloRevealControlBlock');
        if (this.config.module === 'Question Bank') {
            container.innerHTML = `
                <div style="margin-top:20px; border-top:1px dashed #CBD5E1; padding-top:20px;">
                    <h4 style="margin:0 0 10px 0; color:#334155;">Solo Reveal Verification System</h4>
                    <p style="font-size:0.85rem; color:#64748B; margin-bottom:12px;">Rate problem parameters to release markschemes:</p>
                    <div style="display:flex; gap:8px;">
                        <button onclick="window.UEFI_Engine.triggerSoloReveal('Easy')" style="background:#EEF2F6; border:1px solid #CBD5E1; padding:6px 12px; border-radius:4px; font-weight:600; cursor:pointer;">Easy</button>
                        <button onclick="window.UEFI_Engine.triggerSoloReveal('Medium')" style="background:#EEF2F6; border:1px solid #CBD5E1; padding:6px 12px; border-radius:4px; font-weight:600; cursor:pointer;">Medium</button>
                        <button onclick="window.UEFI_Engine.triggerSoloReveal('Hard')" style="background:#EEF2F6; border:1px solid #CBD5E1; padding:6px 12px; border-radius:4px; font-weight:600; cursor:pointer;">Hard</button>
                        <button onclick="window.UEFI_Engine.triggerSoloReveal('Very Hard')" style="background:#EEF2F6; border:1px solid #CBD5E1; padding:6px 12px; border-radius:4px; font-weight:600; cursor:pointer;">Very Hard</button>
                        <button onclick="window.UEFI_Engine.triggerSoloReveal('No Clue')" style="background:#FEF2F2; border:1px solid #FCA5A5; color:#991B1B; padding:6px 12px; border-radius:4px; font-weight:600; cursor:pointer;">No Clue</button>
                    </div>
                </div>`;
        } else {
            container.innerHTML = '';
        }
    },

    triggerSoloReveal: function(tier) {
        alert(`Assessment metric parsed: [${tier}]. Markscheme array validation authorized below.`);
        // Points the layout link directly to your target solutions file
        document.getElementById('uefiPdfFrameTarget').src = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf#page=2";
    },

    mountDesmosCalculator: function() {
        const container = document.getElementById('desmosCalculatorAppMount');
        container.innerHTML = `
            <div style="background:#000; color:#fff; border-radius:8px; padding:12px; font-weight:700; font-size:0.9rem; display:flex; align-items:center; justify-content:space-between;">
                <span><i class="fas fa-calculator" style="color:#10B981;"></i> Embedded Desmos Matrix Terminal</span>
            </div>
            <iframe src="https://www.desmos.com/scientific" style="width:100%; height:300px; border:1px solid #E2E8F0; border-top:none; border-radius:0 0 8px 8px;"></iframe>`;
    },

    mountRichNotePad: function() {
        const container = document.getElementById('richNotePadAppMount');
        container.innerHTML = `
            <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:15px; margin-top:20px;">
                <div style="border-bottom:1px solid #E2E8F0; padding-bottom:10px; margin-bottom:10px; display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
                    <button onclick="document.execCommand('bold',false,null)" style="font-weight:bold; width:30px; height:30px; cursor:pointer;">B</button>
                    <button onclick="document.execCommand('underline',false,null)" style="text-decoration:underline; width:30px; height:30px; cursor:pointer;">U</button>
                    <button onclick="document.execCommand('italic',false,null)" style="font-style:italic; width:30px; height:30px; cursor:pointer;">I</button>
                    <select onchange="document.execCommand('foreColor',false,this.value)" style="padding:4px; cursor:pointer;">
                        <option value="#000000">Black text</option>
                        <option value="#FF0000">Red ink</option>
                        <option value="#0056B3">UEFI Blue</option>
                        <option value="#10B981">Green pass</option>
                    </select>
                    <select onchange="document.execCommand('hiliteColor',false,this.value)" style="padding:4px; cursor:pointer;">
                        <option value="transparent">Clear marker</option>
                        <option value="#FFFF00">Yellow highlight</option>
                        <option value="#00FFFF">Cyan highlight</option>
                    </select>
                    <button onclick="window.UEFI_Engine.downloadNotes()" style="margin-left:auto; background:#0056B3; color:#fff; border:none; padding:5px 10px; border-radius:4px; font-weight:600; font-size:0.8rem; cursor:pointer;"><i class="fas fa-download"></i> Save Notes</button>
                </div>
                <div id="uefiRichNotePadEditorNode" contenteditable="true" style="font-family:'Times New Roman', Times, serif; font-size:1.1rem; min-height:200px; max-height:300px; overflow-y:auto; border:1px solid #F1F5F9; padding:10px; outline:none; background:#FFF;">
                    Initialize task documentation or video transcription matrices here...
                </div>
            </div>`;
    },

    downloadNotes: function() {
        const content = document.getElementById('uefiRichNotePadEditorNode').innerText;
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${this.config.subject}_${this.config.topic}_UEFI_Session_Notes.txt`;
        link.click();
    }
};
