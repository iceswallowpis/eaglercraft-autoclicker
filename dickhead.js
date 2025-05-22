// ==UserScript==
// @name         nicehack autoclicker v69 [BILL CLINTON THE GOAT]
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  nicehack autoclicker v69 [BILL CLINTON THE GOAT]
// @match        *://*eaglercraft.com/mc/1.8.8*/**
// @author       https://discord.gg/r8tk45Yprv -- join or gay!!!
// @grant        none
// ==/UserScript==

// made in like a few hours after i got super high
// i hate javascript so much oh my dear fucking god -- this code is filled with shit and has like 0 proper logic if u will to paste this god awful shit you better recode most of it

(function () {
    'use strict';

    let settings = {
        enabled: false, // is this shit enabled????????????
        minCPS: 11, // min cps ( obv what have you thought huh )
        maxCPS: 14, // max cps (self explanatory tbh)
        toggleKey: 'f', // key to toggle the autoclicker on or off
        jitterEnabled: true, // jitter clicking effect
        jitterIntensity: 2,
        shiftDisableEnabled: true, // this is broken too lazy to fix
        humanizedModeEnabled: true, // randomization keep this to be true to avoid bans
        fatigueFactor: 0.5, // idfk
        burstChance: 0.15, // drop - spike chance
        disableInMenus: true,
    };

    let interval = null;
    let shiftPressed = false;
    let clickStart = null;
    let consecutiveClicks = 0;
    let lastClickTime = 0;
    let jitterInterval = null;

    function loadSettings() {
        const savedSettings = localStorage.getItem('nicehack_autoclicker_settings');
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                settings = { ...settings, ...parsedSettings };
            } catch (e) {
                console.error('Failed to parse saved settings:', e);
            }
        }
    }

    function saveSettings() {
        localStorage.setItem('nicehack_autoclicker_settings', JSON.stringify(settings));
    }
    // despite this being basic and shit in my opinion it still gets the job done and bypasses every server on eaglercraft (shoutout to archmc)
    function humanizedDelay() {
        let baseCPS = Math.random() * (settings.maxCPS - settings.minCPS) + settings.minCPS;
        let delay = 1000 / baseCPS;

        if (settings.humanizedModeEnabled) {
            const microVariation = (Math.random() * 4 + 3) * (Math.random() > 0.5 ? 1 : -1);
            delay += microVariation;

            if (clickStart) {
                const clickDuration = Date.now() - clickStart;

                if (clickDuration > 4000 + Math.random() * 4000) {
                    const fatigue = Math.min((clickDuration - 4000) / 10000, 1) * settings.fatigueFactor;
                    delay *= (1 + fatigue);
                }
            }

            if (Math.random() < settings.burstChance) {
                delay *= 0.85 + Math.random() * 0.1;
            }

            const patternMod = Math.sin(consecutiveClicks * 0.4) * 15;
            delay += patternMod;

            const minDelay = 1000 / (settings.maxCPS * 1.1);
            const maxDelay = 1000 / (settings.minCPS * 0.9);
            delay = Math.max(minDelay, Math.min(delay, maxDelay));
        }

        return delay;
    }

    function isInGame() {
        // this is dumb in my brutally honest opinion
        if (!settings.disableInMenus) {

            return true;
        }

        return document.pointerLockElement !== null;
    }

    function applyJitter() {
        if (!settings.jitterEnabled || !settings.enabled || !isInGame()) return;

        const canvas = document.querySelector("canvas");
        if (!canvas) return;

        let intensity = settings.jitterIntensity;

        if (settings.humanizedModeEnabled) {
            const timeOffset = Date.now() % 1000 / 1000;
            const clickFactor = Math.min(consecutiveClicks / 10, 1);

            const jitterVariation = Math.random() < 0.7 ? 0.8 : 1.4;
            intensity *= jitterVariation;

            const jitterPattern = (Math.sin(Date.now() / 250) * 0.6 + 0.7);
            intensity *= jitterPattern;

            if (clickStart) {
                const clickDuration = Date.now() - clickStart;
                if (clickDuration > 2000) {
                    const fatigue = Math.min((clickDuration - 2000) / 8000, 0.8) * settings.fatigueFactor;
                    intensity *= (1 - fatigue * 0.3);
                }
            }
        }

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * intensity;

        const jitterX = Math.cos(angle) * distance * (Math.random() < 0.3 ? 1.5 : 1);
        const jitterY = Math.sin(angle) * distance * (Math.random() < 0.7 ? 0.6 : 1.2);

        const microAdjustX = (Math.random() * 0.8 - 0.4) * intensity * 0.3;
        const microAdjustY = (Math.random() * 0.8 - 0.4) * intensity * 0.3;

        const finalX = jitterX + microAdjustX;
        const finalY = jitterY + microAdjustY;

        const moveEvent = new MouseEvent("mousemove", {
            bubbles: true,
            cancelable: true,
            view: window,
            movementX: finalX,
            movementY: finalY
        });

        canvas.dispatchEvent(moveEvent);

        if (Math.random() < 0.08) {
            setTimeout(() => {
                if (settings.enabled) {
                    const burstEvent = new MouseEvent("mousemove", {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        movementX: finalX * -0.7,
                        movementY: finalY * -0.7
                    });
                    canvas.dispatchEvent(burstEvent);
                }
            }, 8 + Math.random() * 15);
        }
    }

    function clickOnce() {
        const canvas = document.querySelector("canvas");
        if (!canvas || !settings.enabled || !isInGame() || (settings.shiftDisableEnabled && shiftPressed)) return;

        const now = Date.now();
        lastClickTime = now;

        if (clickStart === null) {
            clickStart = now;
        }

        consecutiveClicks++;

        const down = new MouseEvent("mousedown", {
            bubbles: true,
            cancelable: true,
            view: window,
            button: 0
        });

        const up = new MouseEvent("mouseup", {
            bubbles: true,
            cancelable: true,
            view: window,
            button: 0
        });

        canvas.dispatchEvent(down);
        canvas.dispatchEvent(up);

        applyJitter();
    }

    function startClicking() {
        if (interval) return;

        clickStart = null;
        consecutiveClicks = 0;

        interval = setTimeout(function loop() {
            clickOnce();

            if (settings.enabled && isInGame() && !(settings.shiftDisableEnabled && shiftPressed)) {
                interval = setTimeout(loop, humanizedDelay());
            } else if (settings.enabled && isInGame() && settings.shiftDisableEnabled && shiftPressed) {
                interval = setTimeout(loop, 100);
            } else {
                interval = null;
            }
        }, humanizedDelay());
    }

    function stopClicking() {
        if (interval) {
            clearTimeout(interval);
            interval = null;
        }
        clickStart = null;
        consecutiveClicks = 0;
    }

    function startJitter() {
        if (jitterInterval) return;
        if (!settings.jitterEnabled) return;

        jitterInterval = setInterval(() => {
            if (!settings.enabled || !isInGame()) {
                stopJitter();
                return;
            }
            applyJitter();
        }, 20);
    }

    function stopJitter() {
        if (jitterInterval) {
            clearInterval(jitterInterval);
            jitterInterval = null;
        }
    }

    function toggleClicker() {
        settings.enabled = !settings.enabled;
      // debug shit // console.log(`[faggot] Autoclicker ${settings.enabled ? 'enabled' : 'disabled'}`);

        if (settings.enabled) {
            startClicking();
            startJitter();
        } else {
            stopClicking();
            stopJitter();
        }

        saveSettings();
    }

    function initialize() {
        loadSettings();

        document.addEventListener("keydown", e => {
            if (e.key === "Shift") {
                shiftPressed = true;
                return;
            }

            const activeTag = document.activeElement.tagName;
            if (activeTag !== "INPUT" && activeTag !== "TEXTAREA") {
                if (e.key.toLowerCase() === settings.toggleKey) {
                    toggleClicker();
                }
            }
        });

        document.addEventListener("keyup", e => {
            if (e.key === "Shift") {
                shiftPressed = false;
                if (settings.enabled && settings.shiftDisableEnabled && !interval && isInGame()) {
                    startClicking();
                }
            }
        });

        document.addEventListener("pointerlockchange", () => {
            if (!document.pointerLockElement && settings.disableInMenus) {
                stopJitter();
            }
        });

        if (settings.enabled) {
            startClicking();
            startJitter();
        }

       // debug shit // console.log(`[faggot] loaded press '${settings.toggleKey}' to toggle.`);
    }

    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(initialize, 1000);
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            setTimeout(initialize, 1000);
        });
    }
})();
