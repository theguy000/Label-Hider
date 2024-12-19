// ==UserScript==
// @name         Purpose Games Background Image Extractor
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Extracts the background image URL from Purpose Games
// @author       You
// @match        https://www.purposegames.com/game/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_log
// ==/UserScript==

(function() {
    'use strict';

    function extractBackgroundImage() {
        const targetElement = document.querySelector('#quizsurface');
        if (targetElement) {
            const backgroundImage = targetElement.style.backgroundImage;
            if (backgroundImage) {
                const urlMatch = backgroundImage.match(/url\("([^"]+)"\)/);
                 if (urlMatch && urlMatch[1]) {
                    const imageUrl = urlMatch[1];
                    GM_log('Background Image URL:', imageUrl);
                    return imageUrl;
                } else {
                    GM_log('Could not extract URL from background-image');
                    return null;
                }
            } else {
                GM_log('Could not find background-image style');
                return null;
            }
        } else {
            GM_log('Could not find target element');
            return null;
        }
    }

    function getElementByXpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    const imageUrl = extractBackgroundImage();
    if (imageUrl) {
        GM_setValue('lastImageUrl', imageUrl);

        const imageElement = getElementByXpath('/html/body/div[2]/div/div[1]/div[1]/div[6]/div[1]');
        if (!imageElement) {
            GM_log('Image not found using XPath');
            return;
        }

        // Create loading overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.backdropFilter = 'blur(5px)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '1000';
        overlay.style.color = 'white';
        overlay.style.fontSize = '2em';
        overlay.style.fontFamily = 'Arial, sans-serif';
        overlay.style.textAlign = 'center';

        const loadingText = document.createElement('div');
        loadingText.textContent = 'Doing the magic';
        overlay.appendChild(loadingText);
        imageElement.parentElement.appendChild(overlay);

        let dots = '';
        const interval = setInterval(() => {
            dots = dots.length < 3 ? dots + '.' : '';
            loadingText.textContent = `Doing the magic${dots}`;
        }, 500);

        imageElement.style.backgroundImage = 'none';

        fetch('http://localhost:5000/set_url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: imageUrl })
        })
        .then(response => {
            if (!response.ok) {
                GM_log('Error sending URL to server:', response.statusText);
            }
            return fetch(`http://localhost:5000/blurred_image.png?t=${new Date().getTime()}`);
        })
        .then(response => response.blob())
        .then(blob => {
            clearInterval(interval);
            overlay.remove();
            const blurredImageUrl = URL.createObjectURL(blob);
            imageElement.style.backgroundImage = `url("${blurredImageUrl}")`;
            GM_log('Background image replaced with blurred version');
        })
        .catch(error => {
            clearInterval(interval);
            overlay.remove();
            GM_log('Error fetching blurred image:', error);
        });
    }
})();
