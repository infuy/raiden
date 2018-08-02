import { HttpClient, HttpHandler } from '@angular/common/http';
import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs/internal/observable/of';
import { Channel } from '../../models/channel';
import { UserToken } from '../../models/usertoken';
import { EllipsisPipe } from '../../pipes/ellipsis.pipe';
import { KeysPipe } from '../../pipes/keys.pipe';
import { SubsetPipe } from '../../pipes/subset.pipe';
import { TokenPipe } from '../../pipes/token.pipe';
import { RaidenConfig } from '../../services/raiden.config';
import { RaidenService } from '../../services/raiden.service';
import { SharedService } from '../../services/shared.service';
import { EventListComponent } from '../event-list/event-list.component';
import { OpenDialogComponent } from '../open-dialog/open-dialog.component';

import { ChannelTableComponent } from './channel-table.component';
import Spy = jasmine.Spy;

export class MockConfig extends RaidenConfig {
    public web3: any = {
        eth: {
            latestBlock: 3694423,
            contract: () => {
            }
        }
    };
}

describe('ChannelTableComponent', () => {
    let component: ChannelTableComponent;
    let fixture: ComponentFixture<ChannelTableComponent>;
    let raidenServiceSpy: Spy;
    let tokenSpy: Spy;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ChannelTableComponent,
                EventListComponent,
                OpenDialogComponent,
                TokenPipe,
                EllipsisPipe,
                KeysPipe,
                SubsetPipe
            ],
            providers: [
                SharedService,
                {
                    provide: RaidenConfig,
                    useClass: MockConfig
                },
                RaidenService,
                HttpClient,
                HttpHandler
            ],
            imports: [
                FormsModule,
                ReactiveFormsModule,
                FormsModule,
                NoopAnimationsModule
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChannelTableComponent);
        const service: RaidenService = TestBed.get(RaidenService);
        raidenServiceSpy = spyOn(service, 'getChannels');
        tokenSpy = spyOn(service, 'getUserToken');
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update action when channel has balance', fakeAsync(() => {

        const token: UserToken = {
            address: '0x0f114A1E9Db192502E7856309cc899952b3db1ED',
            symbol: 'TST',
            name: 'Test Suite Token',
            balance: 20
        };

        const channel1: Channel = {
            state: 'opened',
            channel_identifier: 1,
            token_address: '0x0f114A1E9Db192502E7856309cc899952b3db1ED',
            partner_address: '0x774aFb0652ca2c711fD13e6E9d51620568f6Ca82',
            reveal_timeout: 600,
            balance: 10,
            settle_timeout: 500,
            userToken: token
        };

        const channel2: Channel = {
            state: 'opened',
            channel_identifier: 2,
            token_address: '0x0f114A1E9Db192502E7856309cc899952b3db1ED',
            partner_address: '0xFC57d325f23b9121a8488fFdE2E6b3ef1208a20b',
            reveal_timeout: 600,
            balance: 0,
            settle_timeout: 500,
            userToken: token
        };

        const channel2Balance: Channel = {
            state: 'opened',
            channel_identifier: 2,
            token_address: '0x0f114A1E9Db192502E7856309cc899952b3db1ED',
            partner_address: '0xFC57d325f23b9121a8488fFdE2E6b3ef1208a20b',
            reveal_timeout: 600,
            balance: 10,
            settle_timeout: 500,
            userToken: token
        };

        const channel3: Channel = {
            state: 'opened',
            channel_identifier: 3,
            token_address: '0x0f114A1E9Db192502E7856309cc899952b3db1ED',
            partner_address: '0xfB398E621c15E2BC5Ae6A508D8D89AF1f88c93e8',
            reveal_timeout: 600,
            balance: 10,
            settle_timeout: 500,
            userToken: token
        };

        const channel4: Channel = {
            state: 'closed',
            channel_identifier: 4,
            token_address: '0x0f114A1E9Db192502E7856309cc899952b3db1ED',
            partner_address: '0x8A0cE8bDA200D64d858957080bf7eDDD3371135F',
            reveal_timeout: 600,
            balance: 60,
            settle_timeout: 600,
            userToken: token

        };

        raidenServiceSpy
            .and
            .returnValues(
                of([channel1, channel2, channel3, channel4]),
                of([channel1, channel2Balance, channel3, channel4])
            );

        tokenSpy.and.returnValue(of(token));

        component.ngOnInit();
        tick(5000);
        fixture.detectChanges();

        let button = fixture.debugElement.query(By.css('#pay-button'));
        let payButton = button.componentInstance as HTMLButtonElement;

        expect(payButton.disabled).toBe(true, 'Payment should be disabled with 0 balance');

        tick(5000);
        fixture.detectChanges();

        button = fixture.debugElement.query(By.css('#pay-button'));
        payButton = button.componentInstance as HTMLButtonElement;

        expect(payButton.disabled).toBe(false, 'Payment option should be enabled with positive balance');

        component.ngOnDestroy();
        flush();
    }));
});
