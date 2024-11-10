const UserFeedback = {
    "title": "Veterinary Site Feedback Form",
    "description": "We value your feedback! Please let us know about your recent experience with our services so we can continue to improve.",
    "questions": [
      {
        "id": 1,
        "question": "How would you rate your overall experience?",
        "type": "rating",
        "options": [
          { "value": 5, "label": "⭐⭐⭐⭐⭐ Excellent" },
          { "value": 4, "label": "⭐⭐⭐⭐ Very Good" },
          { "value": 3, "label": "⭐⭐⭐ Good" },
          { "value": 2, "label": "⭐⭐ Fair" },
          { "value": 1, "label": "⭐ Poor" }
        ]
      },
      {
        "id": 2,
        "question": "What did you like about our service?",
        "type": "text",
        "placeholder": "Feel free to share what stood out to you, such as staff friendliness, ease of booking, clinic cleanliness, etc."
      },
      {
        "id": 3,
        "question": "What could we improve?",
        "type": "text",
        "placeholder": "Let us know any specific areas you feel could be enhanced to improve your experience."
      },
      {
        "id": 4,
        "question": "Would you recommend our veterinary services to others?",
        "type": "choice",
        "options": [
          { "value": "yes", "label": "Yes" },
          { "value": "no", "label": "No" }
        ]
      },
      {
        "id": 5,
        "question": "Additional Comments or Suggestions:",
        "type": "text",
        "placeholder": "Your Answer"
      }
    ],
    "thankYouMessage": "Thank you for your time and valuable feedback!"
  }

 const animalShelter = {
    "title": "Animal Shelter Feedback Form",
    "description": "Thank you for visiting our animal shelter! Your feedback is important to us as we strive to improve our services and provide the best possible care for our animals.",
    "questions": [
      {
        "id": 1,
        "question": "How would you rate your overall experience at our shelter?",
        "type": "rating",
        "options": [
          { "value": 5, "label": "⭐⭐⭐⭐⭐ Excellent" },
          { "value": 4, "label": "⭐⭐⭐⭐ Very Good" },
          { "value": 3, "label": "⭐⭐⭐ Good" },
          { "value": 2, "label": "⭐⭐ Fair" },
          { "value": 1, "label": "⭐ Poor" }
        ]
      },
      {
        "id": 2,
        "question": "How would you rate the cleanliness and organization of the shelter?",
        "type": "rating",
        "options": [
          { "value": 5, "label": "⭐⭐⭐⭐⭐ Excellent" },
          { "value": 4, "label": "⭐⭐⭐⭐ Very Good" },
          { "value": 3, "label": "⭐⭐⭐ Good" },
          { "value": 2, "label": "⭐⭐ Fair" },
          { "value": 1, "label": "⭐ Poor" }
        ]
      },
      {
        "id": 3,
        "question": "What did you appreciate most about our shelter?",
        "type": "text",
        "placeholder": "For example, staff helpfulness, animal care, ease of adoption process, etc."
      },
      {
        "id": 4,
        "question": "Were there any areas you think could be improved?",
        "type": "text",
        "placeholder": "Please let us know any specific suggestions for improvement."
      },
      {
        "id": 5,
        "question": "Would you recommend our shelter to others looking to adopt a pet?",
        "type": "choice",
        "options": [
          { "value": "yes", "label": "Yes" },
          { "value": "no", "label": "No" }
        ]
      },
      {
        "id": 6,
        "question": "How did you hear about our shelter?",
        "type": "choice",
        "options": [
          { "value": "social_media", "label": "Social Media" },
          { "value": "website", "label": "Website" },
          { "value": "friend_or_family", "label": "Friend or Family" },
          { "value": "event", "label": "Community Event" },
          { "value": "other", "label": "Other" }
        ]
      },
      {
        "id": 7,
        "question": "Additional Comments or Suggestions:",
        "type": "text",
        "placeholder": "Your Answer"
      }
    ],
    "thankYouMessage": "Thank you for your feedback and support of our shelter! Together, we can continue to provide a safe and caring environment for animals in need."
  }
  
  
  export default UserFeedback;