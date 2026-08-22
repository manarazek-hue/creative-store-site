(() => {
  "use strict";


  // ========================================================
  // MOBILE NAVIGATION
  // ========================================================

  const menuButton =
    document.getElementById(
      "menuButton"
    );

  const mobileNav =
    document.getElementById(
      "mobileNav"
    );


  function closeMenu() {

    if (
      !menuButton ||
      !mobileNav
    ) {
      return;
    }

    mobileNav.hidden = true;

    menuButton.setAttribute(
      "aria-expanded",
      "false"
    );

    menuButton.textContent =
      "Menu";
  }


  function toggleMenu() {

    if (
      !menuButton ||
      !mobileNav
    ) {
      return;
    }

    const opening =
      mobileNav.hidden;

    mobileNav.hidden =
      !opening;

    menuButton.setAttribute(
      "aria-expanded",
      String(opening)
    );

    menuButton.textContent =
      opening
        ? "Close"
        : "Menu";
  }


  if (
    menuButton &&
    mobileNav
  ) {

    menuButton.addEventListener(
      "click",
      toggleMenu
    );


    mobileNav
      .querySelectorAll("a")
      .forEach(link => {

        link.addEventListener(
          "click",
          closeMenu
        );

      });


    window.addEventListener(
      "resize",
      () => {

        if (
          window.innerWidth >
          700
        ) {
          closeMenu();
        }

      }
    );

  }


  // ========================================================
  // CONTACT FORM
  // ========================================================

  const contactForm =
    document.getElementById(
      "contactForm"
    );


  if (contactForm) {

    const submitButton =
      document.getElementById(
        "contactSubmit"
      );

    const errorBox =
      document.getElementById(
        "contactError"
      );

    const successBox =
      document.getElementById(
        "contactSuccess"
      );

    const sendAnother =
      document.getElementById(
        "sendAnother"
      );


    contactForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();


        errorBox.hidden = true;

        submitButton.disabled =
          true;

        const originalText =
          submitButton.textContent;

        submitButton.textContent =
          "Sending...";


        try {

          const formData =
            new FormData(
              contactForm
            );


          const response =
            await fetch(
              contactForm.action,
              {
                method: "POST",

                body: formData,

                headers: {
                  Accept:
                    "application/json"
                }
              }
            );


          if (!response.ok) {

            let message =
              "Your message could not be sent. Please try again.";

            try {

              const result =
                await response.json();

              if (
                result.errors &&
                result.errors.length
              ) {

                message =
                  result.errors
                    .map(
                      item =>
                        item.message
                    )
                    .join(" ");

              }

            }
            catch {
              // Use generic error.
            }


            throw new Error(
              message
            );

          }


          contactForm.reset();

          contactForm.hidden =
            true;

          successBox.hidden =
            false;

        }
        catch (error) {

          console.error(
            "Contact submission failed:",
            error
          );

          errorBox.textContent =
            error.message ||
            "Your message could not be sent. Please try again.";

          errorBox.hidden =
            false;

        }
        finally {

          submitButton.disabled =
            false;

          submitButton.textContent =
            originalText;

        }

      }
    );


    sendAnother.addEventListener(
      "click",
      () => {

        successBox.hidden =
          true;

        contactForm.hidden =
          false;

        document.getElementById(
          "contactName"
        ).focus();

      }
    );

  }


})();
