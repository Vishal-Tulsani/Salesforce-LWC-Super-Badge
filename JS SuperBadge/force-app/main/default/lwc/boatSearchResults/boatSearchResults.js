import { LightningElement, wire, api, track } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from "@salesforce/apex/BoatDataService.updateBoatList";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { publish, MessageContext } from 'lightning/messageService';
import BoatMC from '@salesforce/messageChannel/BoatMessageChannel__c';

export default class boatSearchResults extends LightningElement {
    boatTypeId = '';
    @track boats;
    @track draftValues = [];
    selectedBoatId = '';
    isLoading = false;
    error = undefined;
    wiredBoatsResult;

    @wire(MessageContext) messageContext;

    columns = [
        { label: 'Name', fieldName: 'Name', type: 'text', editable: 'true'  },
        { label: 'Length', fieldName: 'Length__c', type: 'number', editable: 'true' },
        { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: 'true' },
        { label: 'Description', fieldName: 'Description__c', type: 'text', editable: 'true' }
    ];

    @api
    searchBoats(boatTypeId) {
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        this.boatTypeId = boatTypeId;
    }

    @wire(getBoats, { boatTypeId: '$boatTypeId' })
    wiredBoats(result) {
        this.boats = result;
        if (result.error) {
            this.error = result.error;
            this.boats = undefined;
        }
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
    }

    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(this.selectedBoatId);
    }

    handleSave(event) {
        this.notifyLoading(true);
        // notify loading
        const updatedFields = event.detail.draftValues;
        // Update the records via Apex
        updateBoatList({ data: updatedFields })
          .then(() => {
            this.dispatchEvent(
              new ShowToastEvent({
                title: SUCCESS_TITLE,
                message: MESSAGE_SHIP_IT,
                variant: SUCCESS_VARIANT
              })
            );
          })
          .catch((error) => {
            this.dispatchEvent(
              new ShowToastEvent({
                title: ERROR_TITLE,
                message: error.message,
                variant: ERROR_VARIANT
              })
            );
          })
          .finally(() => {
            this.refresh();
          });
    }

    @api
    async refresh() {
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        await refreshApex(this.boats);
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
    }


    notifyLoading(isLoading) {
        if (isLoading) {
            this.dispatchEvent(new CustomEvent('loading'));
        } else {
            this.dispatchEvent(CustomEvent('doneloading'));
        }
    }

     sendMessageService(boatId) {
        publish(this.messageContext, BoatMC, { recordId : boatId });
    }
}