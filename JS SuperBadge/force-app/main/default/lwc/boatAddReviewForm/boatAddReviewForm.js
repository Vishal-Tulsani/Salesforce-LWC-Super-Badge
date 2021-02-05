import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import NAME_FIELD from "@salesforce/schema/BoatReview__c.Name";
import COMMENT_FIELD from "@salesforce/schema/BoatReview__c.Comment__c";
import BOAT_REVIEW_OBJECT from "@salesforce/schema/BoatReview__c";
const SUCCESS_TITLE = "Review Created!";
const SUCCESS_VARIANT = "success";
export default class BoatAddReviewForm extends LightningElement {
  // Private
  boatId;
  rating = 0;
  boatReviewObject = BOAT_REVIEW_OBJECT;
  nameField = NAME_FIELD;
  commentField = COMMENT_FIELD;
  labelSubject = "Review Subject";
  labelRating = "Rating";
  labelComment = "Comment";
  @track
  subject;
  // Public Getter and Setter to allow for logic to run on recordId change
  get recordId() {
    return this.boatId;
  }
  @api
  set recordId(value) {
    this.setAttribute("boatId", value);
    this.boatId = value;
  }
  handleReviewCreated() {}
  handleRatingChanged(event) {
    this.rating = event.detail.rating;
  }
  // Custom submission handler to properly set Rating
  // This function must prevent the anchor element from navigating to a URL.
  // form to be submitted: lightning-record-edit-form
  handleSubmit(event) {
    event.preventDefault(); // stop the form from submitting
    const fields = event.detail.fields;
    fields.Boat__c = this.boatId;
    fields.Rating__c = this.rating;
    this.template.querySelector("lightning-record-edit-form").submit(fields);
  }
  // Shows a toast message once form is submitted successfully
  // Dispatches event when a review is created
  handleSuccess() {
    this.dispatchEvent(
      new ShowToastEvent({
        title: SUCCESS_TITLE,
        variant: SUCCESS_VARIANT
      })
    );
    this.handleReset();
    this.dispatchEvent(new CustomEvent("createreview"));
  }
  // Clears form data upon submission
  handleReset() {
    const inputFields = this.template.querySelectorAll("lightning-input-field");
    if (inputFields) {
      inputFields.forEach((field) => {
        field.reset();
      });
    }
  }
}