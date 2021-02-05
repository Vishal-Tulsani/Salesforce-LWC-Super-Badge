  
// Custom Labels Imports
import labelDetails from "@salesforce/label/c.Details";
import labelReviews from "@salesforce/label/c.Reviews";
import labelAddReview from "@salesforce/label/c.Add_Review";
import labelFullDetails from "@salesforce/label/c.Full_Details";
import labelPleaseSelectABoat from "@salesforce/label/c.Please_select_a_boat";
import { NavigationMixin } from "lightning/navigation";
import {
  APPLICATION_SCOPE,
  MessageContext,
  subscribe,
  unsubscribe
} from "lightning/messageService";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { wire, LightningElement } from "lwc";
// Boat__c Schema Imports
import BOAT_ID_FIELD from "@salesforce/schema/Boat__c.Id";
import BOAT_NAME_FIELD from "@salesforce/schema/Boat__c.Name";

const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];
export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  activeTabValue = "";
  boatId;
  @wire(getRecord, { fields: BOAT_FIELDS, recordId: "$boatId" })
  wiredRecord;
  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat
  };
  // Initialize messageContext for Message Service
  @wire(MessageContext)
  messageContext;
  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
  get detailsTabIconName() {
    if (this.wiredRecord.data) {
      return "utility:anchor";
    }
    return null;
  }

  // Utilize getFieldValue to extract the boat name from the record wire
  get boatName() {
    return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
  }

  // Private
  subscription = null;

  // Subscribe to the message channel
  subscribeMC() {
    // local boatId must receive the recordId from the message
    if (this.subscription) {
      return;
    }
    // Subscribe to the message channel to retrieve the recordId and explicitly assign it to boatId.
    this.subscription = subscribe(
      this.messageContext,
      BOATMC,
      (message) => {
        console.log("new boatid", message.recordId);
        this.boatId = message.recordId;
      },
      { scope: APPLICATION_SCOPE }
    );
  }
  unsubscribeMC() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  // Calls subscribeMC()
  connectedCallback() {
    this.subscribeMC();
  }
  disconnectedCallback() {
    this.unsubscribeMC();
  }
  // Navigates to record page
  navigateToRecordViewPage() {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        objectApiName: "Boat__c",
        actionName: "view",
        recordId: this.boatId
      }
    });
  }

  // Navigates back to the review list, and refreshes reviews component
  handleReviewCreated() {
    this.template.querySelector(
      "lightning-tabset"
    ).activeTabValue = this.label.labelReviews;
    this.template.querySelector("c-boat-reviews").refresh();
  }
}