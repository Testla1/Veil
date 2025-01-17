document.addEventListener('DOMContentLoaded', function() {
    const text = "A simple tool for tracking LMS and more";
    const dynamicText = document.getElementById('dynamic-text');
    let index = 0;

    function typeText() {
        if (index < text.length) {
            dynamicText.innerHTML = text.substring(0, index + 1) + '_';
            index++;
            setTimeout(typeText, 100); // Adjust the speed by changing the timeout value
        } else {
            dynamicText.innerHTML = text; // Display the full text without the blinking underscore
        }
    }

    typeText();

    const cancelButton = document.getElementById('cancel-button');
    cancelButton.addEventListener('click', function() {
        window.close();
    });

    const form = document.getElementById('license-form');
    const licenseKeyInput = document.getElementById('license-key');
    const formContainer = document.getElementById('form-container');
    const successContainer = document.getElementById('success-container');

    const skibidiCode = [
        "86 69 73 76", 
        "105 108 111 118 101 108 111 108 105 115 111 109 117 99 104"
    ];

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent actual form submission
        const enteredKey = licenseKeyInput.value.trim();
        const validKeyStrings = skibidiCode.map(iEatKids);
        console.log("Entered Key:", enteredKey); // Debugging line
        console.log("Valid Key Strings:", validKeyStrings); // Debugging line
        if (validKeyStrings.includes(enteredKey)) {
            console.log("Key is valid"); // Debugging line
            licenseKeyInput.classList.remove('error'); // Remove error class if input is valid
            formContainer.classList.add('morph-out'); // Add morph-out class to form container
            successContainer.classList.add('morph-in'); // Add morph-in class to success container
            setTimeout(() => {
                formContainer.style.display = 'none'; // Hide the form container after morphing out
                successContainer.style.display = 'block'; // Show the success container after morphing in
            }, 1000); // Morph animation duration
            
            setTimeout(() => {
                localStorage.setItem('validKeyEntered', 'true'); // Set flag in local storage
                window.location.href = './QStext.html'; // Redirect to QS-GUI after delay
            }, 3000); // Delay of 3 seconds
        } else {
            console.log("Key is invalid"); // Debugging line
            licenseKeyInput.classList.add('error'); // Add error class to input
            setTimeout(() => {
                licenseKeyInput.classList.remove('error'); // Remove error class after 3 seconds
            }, 3000);
        }
    });

    function iEatKids(pewdiepie) {
        return pewdiepie.split(' ').map(char => String.fromCharCode(char)).join('');
    }

    licenseKeyInput.addEventListener('input', function() {
        if (licenseKeyInput.value.trim() !== '') {
            licenseKeyInput.classList.remove('error'); // Remove error class on input
        }
    });
});