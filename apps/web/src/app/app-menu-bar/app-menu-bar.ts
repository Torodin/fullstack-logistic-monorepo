import { Component } from "@angular/core";
import { MenuItem } from "primeng/api";
import { MenubarModule } from "primeng/menubar";

@Component({
    selector: "app-menu-bar",
    template: `
        <div class="card">
            <p-menubar [model]="items"/>
        </div>
    `,
    standalone: true,
    imports: [MenubarModule]
})
export class AppMenuBar {
    items: MenuItem[] = [
        {
            label: 'Tracking',
            icon: 'pi pi-map-marker'
        },
    ]
}
