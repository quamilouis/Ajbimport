/* =========================================================
   AJB IMPORTS
   ADMIN AUTHENTICATION
   Login, Forgot Password, Reset Password
======================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           MESSAGE HELPER
        ===================================================== */

        function showMessage(
            message,
            type = "error"
        ) {

            const box =
                document.getElementById(
                    "authMessage"
                );

            if (!box) return;

            box.textContent = message;

            box.className =
                `message show ${type}`;

        }


        /* =====================================================
           PASSWORD VISIBILITY TOGGLE
        ===================================================== */

        function initPasswordToggle(
            inputId,
            buttonId
        ) {

            const toggle =
                document.getElementById(
                    buttonId
                );

            const input =
                document.getElementById(
                    inputId
                );


            if (
                toggle &&
                input
            ) {

                toggle.addEventListener(
                    "click",
                    () => {

                        const isPassword =
                            input.type ===
                            "password";


                        input.type =
                            isPassword
                                ? "text"
                                : "password";


                        const icon =
                            toggle.querySelector(
                                "i"
                            );


                        if (icon) {

                            icon.className =
                                isPassword
                                    ? "fa-solid fa-eye"
                                    : "fa-solid fa-eye-slash";

                        }

                    }
                );

            }

        }


        /* =====================================================
           PASSWORD STRENGTH METER
        ===================================================== */

        function validatePassword(
            value
        ) {

            return {

                length:
                    value.length >= 8,

                uppercase:
                    /[A-Z]/.test(value),

                number:
                    /[0-9]/.test(value),

                special:
                    /[^A-Za-z0-9]/.test(value)

            };

        }


        function updatePasswordStrength(
            value
        ) {

            const results =
                validatePassword(value);


            const fields = {

                length:
                    document.getElementById(
                        "length"
                    ),

                uppercase:
                    document.getElementById(
                        "uppercase"
                    ),

                number:
                    document.getElementById(
                        "number"
                    ),

                special:
                    document.getElementById(
                        "special"
                    )

            };


            let score = 0;


            Object.keys(results)
                .forEach(key => {

                    const element =
                        fields[key];


                    if (!element) return;


                    if (results[key]) {

                        element.classList.add(
                            "valid"
                        );

                        element.classList.remove(
                            "invalid"
                        );

                        element.textContent =
                            "✓ " +
                            element.textContent
                                .replace(
                                    /^[✕✓]\s*/,
                                    ""
                                );

                        score++;

                    } else {

                        element.classList.add(
                            "invalid"
                        );

                        element.classList.remove(
                            "valid"
                        );

                        element.textContent =
                            "✕ " +
                            element.textContent
                                .replace(
                                    /^[✕✓]\s*/,
                                    ""
                                );

                    }

                });


            const bar =
                document.getElementById(
                    "strengthBar"
                );


            if (!bar) return;


            const percentage =
                (score / 4) * 100;


            bar.style.width =
                `${percentage}%`;


            if (score <= 1) {

                bar.style.background =
                    "#d93025";

            } else if (score <= 3) {

                bar.style.background =
                    "#f9ab00";

            } else {

                bar.style.background =
                    "#188038";

            }

        }


        /* =====================================================
           LOGIN PAGE
        ===================================================== */

        const loginForm =
            document.getElementById(
                "adminLoginForm"
            );


        if (loginForm) {

            initPasswordToggle(
                "password",
                "togglePassword"
            );


            loginForm.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();


                    const button =
                        document.getElementById(
                            "loginButton"
                        );

                    const email =
                        document.getElementById(
                            "email"
                        ).value.trim();

                    const passwordValue =
                        document.getElementById(
                            "password"
                        ).value;


                    if (button) {

                        button.disabled = true;

                        button.innerHTML =
                            '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';

                    }


                    try {

                        const response =
                            await fetch(
                                "/api/admin/login",
                                {

                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({
                                            email,
                                            password:
                                                passwordValue
                                        })

                                }
                            );


                        const result =
                            await response.json();


                        if (!response.ok) {

                            throw new Error(
                                result.message ||
                                "Login failed."
                            );

                        }


                        showMessage(
                            "Login successful. Opening dashboard...",
                            "success"
                        );


                        setTimeout(
                            () => {

                                window.location.href =
                                    "/admin/dashboard";

                            },
                            600
                        );

                    } catch (error) {

                        showMessage(
                            error.message
                        );


                        if (button) {

                            button.disabled =
                                false;

                            button.innerHTML =
                                '<span>Sign In</span>' +
                                '<i class="fa-solid fa-arrow-right"></i>';

                        }

                    }

                }
            );

        }


        /* =====================================================
           FORGOT PASSWORD PAGE
        ===================================================== */

        const forgotForm =
            document.getElementById(
                "forgotPasswordForm"
            );


        if (forgotForm) {

            const passwordInput =
                document.getElementById(
                    "password"
                );


            if (passwordInput) {

                initPasswordToggle(
                    "password",
                    "togglePassword"
                );

                passwordInput.addEventListener(
                    "input",
                    () => {

                        updatePasswordStrength(
                            passwordInput.value
                        );

                    }
                );

            }


            forgotForm.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();


                    const email =
                        document.getElementById(
                            "email"
                        ).value.trim();

                    const button =
                        document.getElementById(
                            "forgotButton"
                        );


                    if (button) {

                        button.disabled = true;

                        button.innerHTML =
                            '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

                    }


                    try {

                        const response =
                            await fetch(
                                "/api/admin/forgot-password",
                                {

                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({
                                            email
                                        })

                                }
                            );


                        const result =
                            await response.json();


                        if (!response.ok) {

                            throw new Error(
                                result.message ||
                                "Unable to process request."
                            );

                        }


                        showMessage(
                            result.message,
                            "success"
                        );


                        forgotForm.reset();


                        if (passwordInput) {

                            updatePasswordStrength(
                                ""
                            );

                        }

                    } catch (error) {

                        showMessage(
                            error.message
                        );

                    } finally {

                        if (button) {

                            button.disabled = false;

                            button.innerHTML =
                                '<i class="fa-solid fa-paper-plane"></i> Send Reset Link';

                        }

                    }

                }
            );

        }


        /* =====================================================
           RESET PASSWORD PAGE
        ===================================================== */

        const resetForm =
            document.getElementById(
                "resetPasswordForm"
            );


        if (resetForm) {

            const urlParams =
                new URLSearchParams(
                    window.location.search
                );


            const token =
                urlParams.get(
                    "token"
                );


            if (!token) {

                const messageBox =
                    document.getElementById(
                        "authMessage"
                    );


                if (messageBox) {

                    messageBox.textContent =
                        "This password reset link is invalid or incomplete.";

                    messageBox.className =
                        "message show error";

                }


                const resetButton =
                    document.getElementById(
                        "resetButton"
                    );


                if (resetButton) {

                    resetButton.disabled = true;

                }

            }


            const passwordInput =
                document.getElementById(
                    "password"
                );


            if (passwordInput) {

                initPasswordToggle(
                    "password",
                    "togglePassword"
                );

                passwordInput.addEventListener(
                    "input",
                    () => {

                        updatePasswordStrength(
                            passwordInput.value
                        );

                    }
                );

            }


            resetForm.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();


                    const passwordValue =
                        document.getElementById(
                            "password"
                        ).value;

                    const confirmPassword =
                        document.getElementById(
                            "confirmPassword"
                        ).value;

                    const button =
                        document.getElementById(
                            "resetButton"
                        );


                    const validation =
                        validatePassword(
                            passwordValue
                        );


                    if (
                        !Object.values(
                            validation
                        ).every(Boolean)
                    ) {

                        showMessage(
                            "Please create a stronger password."
                        );

                        return;

                    }


                    if (
                        passwordValue !==
                        confirmPassword
                    ) {

                        showMessage(
                            "Passwords do not match."
                        );

                        return;

                    }


                    if (button) {

                        button.disabled = true;

                        button.innerHTML =
                            '<i class="fa-solid fa-spinner fa-spin"></i> Resetting...';

                    }


                    try {

                        const response =
                            await fetch(
                                "/api/admin/reset-password",
                                {

                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({
                                            token,
                                            password:
                                                passwordValue
                                        })

                                }
                            );


                        const result =
                            await response.json();


                        if (!response.ok) {

                            throw new Error(
                                result.message ||
                                "Password reset failed."
                            );

                        }


                        showMessage(
                            "Password reset successfully. Redirecting to login...",
                            "success"
                        );


                        resetForm.reset();


                        if (passwordInput) {

                            updatePasswordStrength(
                                ""
                            );

                        }


                        setTimeout(
                            () => {

                                window.location.href =
                                    "/admin-login.html";

                            },
                            1500
                        );

                    } catch (error) {

                        showMessage(
                            error.message
                        );


                        if (button) {

                            button.disabled = false;

                            button.innerHTML =
                                '<i class="fa-solid fa-shield-halved"></i> Reset Password';

                        }

                    }

                }
            );

        }

    }
);
