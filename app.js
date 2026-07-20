/**
 * AssessPrep Dynamic Platform Engine Core Execution Script
 * Handles viewports, repositories, runtime state, and DOM rendering.
 */

const AssessmentEngine = (function() {
    'use strict';

    // Application state matrix
    const state = {
        runtimeSessionActive: false,
        timerTicksRemaining: 0,
        timerPaused: false,
        activePaperDatasetIndex: 0,
        ogunnaRevealActive: false,
        activeUtilityTab: 'desmos',
        cachedFilteredCollection: []
    };

    let executionTickerInterval = null;

    // Local cache selectors
    let domModal, domClockDigits, domToggleBtn, domFilterYear, domFilterQuery, domPaperSelect, domDocHeading, domPdfFrame, domOgunnaBtn;

    function cacheDocumentElements() {
        domModal = document.getElementById('pomodoro-modal');
        domClockDigits = document.getElementById('timer-clock-digits');
        domToggleBtn = document.getElementById('timer-toggle-action-btn');
        domFilterYear = document.getElementById('year-filter-dropdown');
        domFilterQuery = document.getElementById('search-query-field');
        domPaperSelect = document.getElementById('paper-select-dropdown');
        domDocHeading = document.getElementById('active-document-heading-label');
        domPdfFrame = document.getElementById('primary-pdf-renderer-node');
        domOgunnaBtn = document.getElementById('ogunna-reveal-action-element');
    }

    function renderDropdownElements() {
        if (!domPaperSelect) return;
        domPaperSelect.innerHTML = '';

        if (state.cachedFilteredCollection.length === 0) {
            const nullOption = document.createElement('option');
            nullOption.value = "-1";
            nullOption.textContent = "NO REVISION PAPERS FOUND MATCHING CRITERIA";
            domPaperSelect.appendChild(nullOption);
            return;
        }

        state.cachedFilteredCollection.forEach((paper, internalIndex) => {
            const optionNode = document.createElement('option');
            optionNode.value = internalIndex.toString();
            optionNode.textContent = `[${paper.year}] - ${paper.displayName} (${paper.topicTag})`;
            domPaperSelect.appendChild(optionNode);
        });
    }

    function syncViewportView() {
        if (state.cachedFilteredCollection.length === 0) {
            domDocHeading.textContent = "NO RUNTIME SPECIFIED DATA CONTAINER LOADED";
            domPdfFrame.src = "about:blank";
            return;
        }

        const exactPaperObject = state.cachedFilteredCollection[state.activePaperDatasetIndex];
        
        if (state.ogunnaRevealActive) {
            domPdfFrame.src = exactPaperObject.markschemePath;
            domDocHeading.textContent = `🔥 MARKSCHEME ACTIVE: ${exactPaperObject.displayName} [${exactPaperObject.component}]`;
            domOgunnaBtn.classList.add('ogunna-active-state');
            domOgunnaBtn.innerHTML = '<span class="ogunna-pulse-ring"></span>👀 HIDE MARKSCHEME (RETURN TO QUESTION)';
        } else {
            domPdfFrame.src = exactPaperObject.questionPath;
            domDocHeading.textContent = `${exactPaperObject.displayName} [${exactPaperObject.component}]`;
            domOgunnaBtn.classList.remove('ogunna-active-state');
            domOgunnaBtn.innerHTML = '<span class="ogunna-pulse-ring"></span>🔥 OGUNNA REVEAL (MARKSCHEME)';
        }
    }

    function executeTimerTick() {
        if (state.timerPaused || !state.runtimeSessionActive) return;

        if (state.timerTicksRemaining > 0) {
            state.timerTicksRemaining--;
            updateClockDisplay();

            if (state.timerTicksRemaining === 300) {
                document.getElementById('runtime-timer-display').classList.add('timer-widget-warning');
            }
        } else {
            state.runtimeSessionActive = false;
            clearInterval(executionTickerInterval);
            document.getElementById('runtime-timer-display').classList.add('timer-widget-warning');
            domClockDigits.textContent = "00:00 - EXPIRED";
            
            // Call audio engine
            AssessmentAudioEngine.triggerCockCrowAlarm();
            
            alert("⚠️ ASSESSMENT CLOCK COMPLETED.\nYour designated focus duration limit has elapsed.\n\nUse the OGUNNA REVEAL matrix tool to grade your analytical responses.");
        }
    }

    function updateClockDisplay() {
        const computedMinutes = Math.floor(state.timerTicksRemaining / 60);
        const computedSeconds = state.timerTicksRemaining % 60;
        
        const outputMinutes = computedMinutes.toString().padStart(2, '0');
        const outputSeconds = computedSeconds.toString().padStart(2, '0');
        
        domClockDigits.textContent = `${outputMinutes}:${outputSeconds}`;
    }

    return {
        initFramework: function() {
            cacheDocumentElements();
            state.cachedFilteredCollection = [...ARCHIVAL_EXAM_REPOSITORY];
            renderDropdownElements();
            if(state.cachedFilteredCollection.length > 0) {
                state.activePaperDatasetIndex = 0;
                syncViewportView();
            }
        },

        initSession: function(durationMinutes) {
            state.timerTicksRemaining = durationMinutes * 60;
            state.runtimeSessionActive = true;
            state.timerPaused = false;
            
            updateClockDisplay();
            domModal.style.opacity = '0';
            setTimeout(() => {
                domModal.style.display = 'none';
            }, 250);

            this.initFramework();
            
            clearInterval(executionTickerInterval);
            executionTickerInterval = setInterval(executeTimerTick, 1000);
        },

        handleFilterChange: function() {
            const evaluationQuery = domFilterQuery.value.trim().toLowerCase();
            const selectedYearFilter = domFilterYear.value;

            state.cachedFilteredCollection = ARCHIVAL_EXAM_REPOSITORY.filter(paper => {
                const criteriaYearMatch = (selectedYearFilter === "ALL" || paper.year === selectedYearFilter);
                const criteriaTextMatch = paper.topicTag.toLowerCase().includes(evaluationQuery) || 
                                          paper.displayName.toLowerCase().includes(evaluationQuery) ||
                                          paper.component.toLowerCase().includes(evaluationQuery);
                return criteriaYearMatch && criteriaTextMatch;
            });

            state.activePaperDatasetIndex = 0;
            state.ogunnaRevealActive = false;
            renderDropdownElements();
            syncViewportView();
        },

        handlePaperSelection: function() {
            const dropValue = parseInt(domPaperSelect.value, 10);
            if (isNaN(dropValue) || dropValue < 0) return;
            
            state.activePaperDatasetIndex = dropValue;
            state.ogunnaRevealActive = false;
            syncViewportView();
        },

        executeOgunnaReveal: function() {
            if (state.cachedFilteredCollection.length === 0) return;
            state.ogunnaRevealActive = !state.ogunnaRevealActive;
            syncViewportView();
        },

        toggleTimerState: function() {
            if (!state.runtimeSessionActive) return;
            state.timerPaused = !state.timerPaused;
            
            if (state.timerPaused) {
                domToggleBtn.textContent = "RESUME";
                domToggleBtn.style.background = "var(--safaricom-green)";
            } else {
                domToggleBtn.textContent = "PAUSE";
                domToggleBtn.style.background = "var(--safaricom-red)";
            }
        },

        switchUtilityTab: function(selectedTabId) {
            state.activeUtilityTab = selectedTabId;
            
            document.querySelectorAll('.instrument-tab-link').forEach(buttonElement => {
                buttonElement.classList.remove('instrument-tab-active');
            });
            document.querySelectorAll('.utility-iframe-wrapper').forEach(wrapperElement => {
                wrapperElement.classList.remove('utility-wrapper-active');
            });

            if (selectedTabId === 'desmos') {
                document.getElementById('tab-trigger-desmos').classList.add('instrument-tab-active');
                document.getElementById('wrapper-pane-desmos').classList.add('utility-wrapper-active');
            } else if (selectedTabId === 'geogebra') {
                document.getElementById('tab-trigger-geogebra').classList.add('instrument-tab-active');
                document.getElementById('wrapper-pane-geogebra').classList.add('utility-wrapper-active');
            }
        }
    };
})();

// Document lifecycle hook initialization bindings
document.addEventListener('DOMContentLoaded', function() {
    // Await manual session selection initialization triggers
});
