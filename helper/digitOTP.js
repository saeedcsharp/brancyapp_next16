export function DgiteOTP() {
  const verids = ["ver0", "ver1", "ver2", "ver3", "ver4", "ver5"];
  const OTPinputs = document.querySelectorAll("input");
  const verInputs = [];
  OTPinputs.forEach((element) => {
    if (verids.find((x) => x === element.id)) verInputs.push(element);
  });
  const button = document.getElementById("submit");

  window.onload = () => verInputs[0].focus();
  verInputs.forEach((input) => {
    input.addEventListener("input", () => {
      const currentInput = input;
      const nextInput = currentInput.nextElementSibling;

      if (currentInput.value.length > 1 && currentInput.value.length == 2) {
        currentInput.value = "";
      }

      if (
        nextInput !== null &&
        nextInput.hasAttribute("disabled") &&
        currentInput.value !== ""
      ) {
        nextInput.removeAttribute("disabled");
        nextInput.focus();
      }

      if (!verInputs[5].disabled && verInputs[5].value !== "") {
        button.classList.remove("fadeDiv");
        button.click();
      } else {
        button.classList.add("fadeDiv");
      }
    });

    input.addEventListener("keyup", (e) => {
      if (e.key == "Backspace") {
        if (input.previousElementSibling != null) {
          e.target.value = "";
          e.target.setAttribute("disabled", true);
          input.previousElementSibling.focus();
        }
        if (verInputs[0].value == "") {
          verInputs[0].removeAttribute("disabled");
          verInputs[0].focus();
        }
      }
    });
  });
}
