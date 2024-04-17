function saveSettings() {
    const apiKey = document.getElementById('api_key').value;
    const serverUrl = document.getElementById('server_url').value;
    const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';

    chrome.storage.sync.set({ 
        api_key: apiKey, 
        server_url: serverUrl, 
        theme: theme 
    }, function() {
        showStatus('Settings saved successfully!', 'success');
    });
}

function loadSettings() {
    chrome.storage.sync.get(['api_key', 'server_url', 'theme'], function(data) {
        document.getElementById('api_key').value = data.api_key || '';
        document.getElementById('server_url').value = data.server_url || '';

        if (data.theme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
    });
}

function resetSettings() {
    if (confirm('Are you sure you want to reset the settings?')) {
        chrome.storage.sync.clear(function() {
            document.getElementById('api_key').value = '';
            document.getElementById('server_url').value = '';
            document.body.classList.remove('light-mode');
            showStatus('Settings reset successfully!', 'success');
        });
    }
}

document.getElementById('save').addEventListener('click', saveSettings);

document.getElementById('reset').addEventListener('click', resetSettings);

document.addEventListener('DOMContentLoaded', loadSettings);

document.getElementById('leverage-slider').addEventListener('input', function() {
    document.getElementById('leverage-input').value = this.value;
});

document.getElementById('leverage-input').addEventListener('input', function() {
    document.getElementById('leverage-slider').value = this.value;
});

const consoleDiv = document.querySelector('.console-content');

function log(message) {
    consoleDiv.innerHTML += `<div>${message}</div>`;  
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = type;
    setTimeout(() => {
        statusDiv.textContent = 'Ready';
        statusDiv.className = '';
    }, 3000);
}

function sendSignal(orderType, tradePair, leverage) {
    const status = document.getElementById('status');
    status.textContent = 'Sending signal...';
    log(`Sending ${orderType} signal for ${tradePair} with ${leverage}x leverage...`);

    chrome.storage.sync.get(['api_key', 'server_url'], function(data) {
        fetch(data.server_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: data.api_key,
                order_type: orderType,
                trade_pair: tradePair,  
                leverage: leverage
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showStatus(`ERROR: ${data.error}`, 'error');
                log(`Server response: ERROR: ${data.error}`);
            } else {
                showStatus(`${orderType} signal sent for ${tradePair} with ${leverage}x leverage`, 'success');
                log(`Server response: ${JSON.stringify(data)}`); 
            }
        })
        .catch(error => {
            showStatus('Network error', 'error');
            log(`Error: ${error.message}`);
        });
    });
}

document.querySelectorAll('#long, #short, #flat').forEach(button => {
    button.addEventListener('click', function() {
        const orderType = this.id.toUpperCase();  
        const tradePair = document.getElementById('asset').value;
        let leverage = document.getElementById('leverage-input').value;

        // Check if the order type is FLAT and set leverage to 0
        if (orderType === 'FLAT') {
            leverage = 0;
        }

        sendSignal(orderType, tradePair, leverage);
    });
});

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

        this.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});


document.getElementById('theme-toggle').addEventListener('click', function() {
    document.body.classList.toggle('light-mode');
    saveSettings();
});
