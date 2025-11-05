import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LinksService {

  buildUberLink(params: {
    pickupLat: number;
    pickupLng: number;
    dropLat: number;
    dropLng: number;
    label?: string;
  }): string {
    const { pickupLat, pickupLng, dropLat, dropLng, label } = params;
    const pickup = `${pickupLat},${pickupLng}`;
    const drop = `${dropLat},${dropLng}`;
    const urlParams = new URLSearchParams({
      action: 'setPickup',
      pickup,
      dropoff: drop,
    });
    if (label) {
      urlParams.set('label', label);
    }
    return `https://m.uber.com/ul/?${urlParams.toString()}`;
  }
}
