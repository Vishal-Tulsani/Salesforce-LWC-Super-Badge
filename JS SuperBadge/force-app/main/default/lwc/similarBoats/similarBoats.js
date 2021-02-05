import { api, LightningElement, wire } from "lwc";
import getSimilarBoats from "@salesforce/apex/BoatDataService.getSimilarBoats";
import { NavigationMixin } from "lightning/navigation";

// imports
// import getSimilarBoats
export default class SimilarBoats extends NavigationMixin(LightningElement) {
  // Private
  currentBoat;
  relatedBoats = null;
  boatId;
  error;

  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute("boatId", value);
    this.boatId = value;
    // sets the boatId attribute
  }
  @api
  similarBy;

  // Wire custom Apex call, using the import named getSimilarBoats
  // Populates the relatedBoats list
  @wire(getSimilarBoats, {
    boatId: "$boatId",
    similarBy: "$similarBy"
  })
  similarBoats({ error, data }) {
    if (error) {
      this.relatedBoats = null;
      this.error = error;
    } else {
      this.relatedBoats = data;
    }
  }
  get getTitle() {
    return "Similar boats by " + this.similarBy;
  }
  get noBoats() {
    return !(this.relatedBoats && this.relatedBoats.length > 0);
  }

  // Navigate to record page
  openBoatDetailPage(event) {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        objectApiName: "Boat__c",
        actionName: "view",
        recordId: event.detail.boatId
      }
    });
  }
}