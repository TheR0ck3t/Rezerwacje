document.addEventListener('DOMContentLoaded', () => {
    // Pobierz dane użytkownika
    axios.get('/user', { withCredentials: true })
        .then(response => {
            const user = response.data;
            document.getElementById('firstName').value = user.firstName || '';
            document.getElementById('lastName').value = user.lastName || '';
            document.getElementById('phoneNumber').value = user.phoneNumber || '';
            document.getElementById('email').value = user.email;
        })
        .catch(error => {
            console.error('Error fetching user data:', error.response ? error.response.data : error.message);
            alert('Wystąpił problem z pobieraniem danych użytkownika.');
        });

    // Obsługa formularza danych osobowych
    document.getElementById('personalInfoForm').addEventListener('submit', event => {
        event.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const phoneNumber = document.getElementById('phoneNumber').value;

        console.log(firstName, lastName, phoneNumber);

        axios.put('/user/info', { firstName, lastName, phoneNumber }, { withCredentials: true })
            .then(() => {
                alert('Dane osobowe zostały zaktualizowane.');
            })
            .catch(error => {
                console.error('Error updating personal info:', error.response ? error.response.data : error.message);
                alert('Nie udało się zaktualizować danych osobowych.');
            });
    });

    // Obsługa formularza zmiany hasła
    document.getElementById('passwordForm').addEventListener('submit', event => {
        event.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Hasła nie są zgodne!');
            return;
        }

        axios.put('/user/password', { oldPassword: currentPassword, newPassword: password, newPasswordConfirm: confirmPassword }, { withCredentials: true })
            .then(() => {
                alert('Hasło zostało zmienione.');
            })
            .catch(error => {
                console.error('Error updating password:', error.response ? error.response.data : error.message);
                alert('Nie udało się zmienić hasła.');
            });
    });

    // Obsługa przycisków z atrybutami data-bs-target
    const toggleButtons = document.querySelectorAll('[data-bs-target]');

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = document.querySelector(button.getAttribute('data-bs-target'));
            const isExpanded = button.getAttribute('aria-expanded') === 'true';

            // Zamknij wszystkie inne karty
            toggleButtons.forEach(btn => {
                if (btn !== button) {
                    const otherTarget = document.querySelector(btn.getAttribute('data-bs-target'));
                    const otherIsExpanded = btn.getAttribute('aria-expanded') === 'true';
                    if (otherIsExpanded) {
                        btn.setAttribute('aria-expanded', 'false');
                        const collapseInstance = bootstrap.Collapse.getInstance(otherTarget);
                        if (collapseInstance) {
                            collapseInstance.hide();
                        } else {
                            new bootstrap.Collapse(otherTarget, { toggle: false }).hide();
                        }
                        btn.textContent = 'Rozwiń';
                    }
                }
            });

            // Zmień tekst przycisku
            if (isExpanded) {
                button.textContent = 'Zwiń';
            } else {
                button.textContent = 'Rozwiń';
            }
        });

        // Nasłuchiwanie na zmiany atrybutu aria-expanded
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'aria-expanded') {
                    const isExpanded = button.getAttribute('aria-expanded') === 'true';
                    if (isExpanded) {
                        button.textContent = 'Zwiń';
                    } else {
                        button.textContent = 'Rozwiń';
                    }
                }
            });
        });

        observer.observe(button, { attributes: true });
    });
});