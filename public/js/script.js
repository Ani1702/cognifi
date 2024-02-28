document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation');

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
          if (!form.checkValidity()) {
              event.preventDefault();
              event.stopPropagation();
          }

          form.classList.add('was-validated');
      }, false);
  });

  // Check if the element with ID 'questionType' exists before adding the event listener
  const questionTypeElement = document.getElementById('questionType');
  if (questionTypeElement) {
      questionTypeElement.addEventListener('change', function () {
          var selectedValue = this.value;

          document.querySelector('.mcq').style.display = 'none';
          document.querySelector('.true-false').style.display = 'none';
          document.querySelector('.descriptive').style.display = 'none';

          if (selectedValue === '0') {
              document.querySelector('.mcq').style.display = 'none';
              document.querySelector('.true-false').style.display = 'none';
              document.querySelector('.descriptive').style.display = 'none';
          } else if (selectedValue === '1') {
              document.querySelector('.mcq').style.display = 'block';
          } else if (selectedValue === '2') {
              document.querySelector('.true-false').style.display = 'block';
          } else if (selectedValue === '3') {
              document.querySelector('.descriptive').style.display = 'block';
          }
      });
  }
});

function addOption() {
    const optionContainer = document.querySelector('.answer');
    const newOptionDiv = document.createElement('div');
    newOptionDiv.classList.add('mb-3');

    const label = document.createElement('label');
    label.setAttribute('for', 'option');
    label.classList.add('form-label');
    label.textContent = 'Option';

    const input = document.createElement('input');
    input.setAttribute('name', 'question[options][]');
    input.classList.add('form-control');
    input.setAttribute('placeholder', 'Enter option');
    input.setAttribute('required', true);

    const invalidFeedback = document.createElement('div');
    invalidFeedback.classList.add('invalid-feedback');
    invalidFeedback.textContent = 'Please enter a valid option!';

    const deleteButton = document.createElement('div');
    deleteButton.classList.add('btn', 'btn-light', 'delete-option');
    deleteButton.textContent = 'Delete option';
    deleteButton.onclick = function () {
        optionContainer.removeChild(newOptionDiv);
    };

    newOptionDiv.appendChild(label);
    newOptionDiv.appendChild(input);
    newOptionDiv.appendChild(invalidFeedback);
    newOptionDiv.appendChild(deleteButton);

    optionContainer.appendChild(newOptionDiv);
}