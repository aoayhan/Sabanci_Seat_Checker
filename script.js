(function(){
    emailjs.init("HX9K1oPjIDR_zv8l1");
})();

document.addEventListener("DOMContentLoaded", function() {
    // This function would be called to start the process
    window.startChecking = function() {
        const email = document.getElementById('email').value;
        const crn = document.getElementById('crn').value;
        const url = `https://suis.sabanciuniv.edu/prod/bwckschd.p_disp_detail_sched?term_in=202302&crn_in=${crn}`;

        // This replaces the Python while loop for continuous checking
        setInterval(() => {
            checkClassAvailability(url, email);
        }, 15000); // Adjust timing as needed
    };
});

function checkClassAvailability(url, receiverEmail) {
    fetch(url).then(response => response.text()).then(data => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");

        // Select all 'th' elements that might contain the text 'Seats'
        const thElements = doc.querySelectorAll('th.ddlabel[scope="row"]');
        let remainingSeatsElement = null;

        // Iterate over the 'th' elements to find the one that contains the text 'Seats'
        thElements.forEach(th => {
            if (th.textContent.includes('Seats')) {
                // Assuming the structure is consistent, the number of seats will be in the 3rd 'td' following this 'th'
                const seatsTd = th.nextElementSibling.nextElementSibling.nextElementSibling;
                if (seatsTd && seatsTd.classList.contains('dddefault')) {
                    remainingSeatsElement = seatsTd;
                }
            }
        });

        if (remainingSeatsElement) {
            const currentSeats = remainingSeatsElement.textContent.trim();
            console.log(`${new Date().toISOString()}: There are ${currentSeats} remaining seat(s).`);

            if (currentSeats !== '0') {
                // Call the EmailJS sending function here
                sendEmailWithEmailJS(receiverEmail, crn); // Adjusted to remove class name parameter
            }
        } else {
            console.log(`${new Date().toISOString()}: Couldn't find the remaining seats element on the page.`);
        }
    }).catch(error => console.error("Error fetching class availability:", error));
}

function sendEmailWithEmailJS(recipientEmail, crnCode) {
    var templateParams = {
        to_name: 'student', // The name of the recipient
        from_name: 'Sabanci Class Checker', // Your name or your institution's name
        message: `A spot in the class ${crnCode} has opened up!`, // The custom message
        to_email: recipientEmail // Here you dynamically set the recipient's email
    };
    
    emailjs.send('service_kfq6pj5', 'template_wht7ice', templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            alert('Email sent successfully!');
        }, function(error) {
            console.log('FAILED...', error);
            alert('Failed to send email.');
        });
}
