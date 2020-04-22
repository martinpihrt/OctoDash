import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { NotificationService } from '../notification/notification.service';

const colorRegexp = /\((.*)\)$/g;

@Injectable({
    providedIn: 'root',
})
export class FilamentManagerService {
    private httpRequest: Subscription;

    public constructor(
        private configService: ConfigService,
        private notificationService: NotificationService,
        private http: HttpClient,
    ) {}

    public getSpoolList(): Promise<FilamentSpoolList> {
        return new Promise((resolve, reject): void => {
            if (this.httpRequest) {
                this.httpRequest.unsubscribe();
            }
            this.httpRequest = this.http
                .get(
                    this.configService.getURL('plugin/filamentmanager/spools').replace('/api', ''),
                    this.configService.getHTTPHeaders(),
                )
                .subscribe(
                    (spools: FilamentSpoolList): void => {
                        spools.spools.forEach((spool): void => {
                            let match = colorRegexp.exec(spool.name);
                            if (match) {
                                spool.color = match[1];
                                spool.displayName = `${spool.profile.vendor} - ${spool.name.replace(match[0], '')}`;
                            } else {
                                spool.color = '#f5f6fa';
                                spool.displayName = `${spool.profile.vendor} - ${spool.name}`;
                            }
                            colorRegexp.lastIndex = 0;
                        });
                        resolve(spools);
                    },
                    (error: HttpErrorResponse): void => {
                        this.notificationService.setError("Can't load filament spools!", error.message);
                        reject();
                    },
                );
        });
    }
}

export interface FilamentSpoolList {
    spools: FilamentSpool[];
}

export interface FilamentSpool {
    /* eslint-disable camelcase */
    cost: number;
    id: number;
    name: string;
    displayName?: string;
    color?: string;
    profile: FilamentProfile;
    temp_offset: number;
    used: number;
    weight: number;
}

interface FilamentProfile {
    density: number;
    diameter: number;
    id: number;
    material: string;
    vendor: string;
}