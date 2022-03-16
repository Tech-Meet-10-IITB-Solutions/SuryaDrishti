import { Component, OnInit, ViewChild } from "@angular/core";

import {
    ChartComponent,
    ApexAxisChartSeries,
    ApexChart,
    ApexFill,
    ApexTooltip,
    ApexXAxis,
    ApexLegend,
    ApexDataLabels,
    ApexTitleSubtitle,
    ApexYAxis,
    ApexMarkers,
    ApexStroke
} from "ng-apexcharts";

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    markers: ApexMarkers;
    stroke: ApexStroke;
    yaxis: ApexYAxis | ApexYAxis[];
    dataLabels: ApexDataLabels;
    title: ApexTitleSubtitle;
    legend: ApexLegend;
    fill: ApexFill;
    tooltip: ApexTooltip;
};

@Component({
    selector: "app-test",
    templateUrl: "./test.component.html",
    styleUrls: ["./test.component.scss"]
})
export class TestComponent implements OnInit {
    title = "CodeSandbox";

    @ViewChild("chart") chart!: ChartComponent;
    public chartOptions: Partial<ChartOptions>;

    constructor() {
        this.chartOptions = {
            series: [
                {
                    name: "Pulse",
                    type: "scatter",
                    data: [{ x: 2009, y: 5 }, { x: 2010, y: 14 }, { x: 2011, y: 10 }, { x: 2012, y: 25 }, { x: 2013, y: 20 }, { x: 2014, y: 50 }, { x: 2015, y: 30 }, { x: 2016, y: 35 }]
                },
                {
                    name: "Revenue",
                    type: "line",
                    data: [{ x: 2009, y: 10.5 }, { x: 2010, y: 5.5 }, { x: 2011, y: 20 }, { x: 2012, y: 1.5 }, { x: 2013, y: 32 }, { x: 2014, y: 10.5 }, { x: 2015, y: 2.20 }, { x: 2016, y: 25.5 }]
                }
            ],
            chart: {
                height: 350,
                type: "line",
                stacked: false
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                width: [0, 5]
            },
            title: {
                text: "XYZ - Stock Analysis (2009 - 2016)",
                align: "left",
                offsetX: 110
            },
            yaxis: [
                {
                    axisTicks: {
                        show: true
                    },
                    axisBorder: {
                        show: true,
                        color: "#008FFB"
                    },
                    labels: {
                        style: {
                            colors: "#008FFB"
                        }
                    },
                    title: {
                        text: "Pulse",
                        style: {
                            color: "#000000"
                        }
                    },
                    tooltip: {
                        enabled: true
                    }
                },
                {
                    seriesName: "Revenue",
                    opposite: true,
                    axisTicks: {
                        show: true
                    },
                    axisBorder: {
                        show: true,
                        color: "#FEB019"
                    },
                    labels: {
                        style: {
                            colors: "#FEB019"
                        }
                    },
                    title: {
                        text: "Income (thousand crores)",
                        style: {
                            color: "#008FFB"
                        }
                    }
                }
            ],
            markers: {
                size: [10, 1]
            }
        };
    }

    ngOnInit(): void { }
}
