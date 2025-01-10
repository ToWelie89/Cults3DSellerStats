import { BarChart, LineChart, PieChart } from "@mui/x-charts";
import { useEffect, useState } from "react";
import ISale from "../interfaces/ISale";
import moment from "moment";
import ICreationExtended from "../interfaces/ICreationExtended";
import { Paper, Tooltip } from "@mui/material";
import chroma from "chroma-js";
import styled from "styled-components";
import AnimatedButton from "./Button";
import { TabsContainer } from "./TabContainer";
import { Tab } from "./Tab";

import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import HelpIcon from "@mui/icons-material/Help";
import { Select } from "./Select";

import GetAverageProfitByDayWorker from "./../getAverageProfitByDayWorker.ts?worker";
import GetIncomeOverTimeWorker from "./../getIncomeOverTimeWorker.ts?worker";
import { round } from "../helpers";
import { Loader } from "./Loader";

const profitByDayWorker = new GetAverageProfitByDayWorker();
const incomeOverTimeWorker = new GetIncomeOverTimeWorker();

interface ISalesChartsProps {
  sales: ISale[] | null;
  creations: ICreationExtended[];
}

enum Tabs {
  DailySales = "Daily Sales",
  MonthlySales = "Monthly Sales",
  TotalIncomeOverTime = "Income Over Time",
  ProfitPerItem = "Profit Per Item",
}

const tabs: Tabs[] = [
  Tabs.DailySales,
  Tabs.MonthlySales,
  Tabs.TotalIncomeOverTime,
  Tabs.ProfitPerItem,
];

const WhiteTab = styled(Tab)`
  background: white;
  &.selected {
    background: white;
    text-decoration: underline;
  }
`;

const IntervalChangeButton = styled.span`
  display: flex;
  align-items: center;
  text-decoration: underline;
  cursor: pointer;
  transition: box-shadow 500ms;

  svg {
    margin-top: 2px;
  }

  &:hover {
    text-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
  }

  &.selected,
  &.disabled {
    pointer-events: none;
    cursor: not-allowed;
    opacity: 0.4;
    text-decoration: none;
  }

  &.selected {
    opacity: 1;
    text-decoration: underline !important;
  }
`;

const StyledAnimatedButton = styled(AnimatedButton)`
  color: black;
  &:hover {
    color: black !important;
  }
`;

const ChartButton = (props: {
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <StyledAnimatedButton
      onClick={props.onClick}
      style={{
        padding: "5px 10px",
        minWidth: "180px",
        display: "flex",
        justifyContent: "center",
        margin: "0",
      }}
    >
      {props.children}
    </StyledAnimatedButton>
  );
};

const ChartContainer = styled.div`
  background: white;
  width: 100%;
  border-radius: 10px;
`;

const DEFAULT_MOMENT_FORMAT = "DD-MM-YYYY";

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

const generateInitialSeries = (
  creations: ICreationExtended[],
  colors: any[]
) => {
  const series: any[] = [];

  const colorStep = Math.floor(150 / creations.length);

  creations.forEach((c, index) => {
    series.push({
      data: [],
      label: c.name,
      id: c.id,
      stack: "total",
      color: colors[index * colorStep],
    });
  });
  return series;
};

const POSSIBLE_INTERVAL_LENGHTS_FOR_DAILY_CHART = [
  10, 15, 20, 25, 30, 35, 40, 45, 50,
];

const SalesCharts = (props: ISalesChartsProps) => {
  const [loading, setLoading] = useState(true);
  const [loadingProfitOverTime, setLoadingProfitOverTime] = useState(false);

  const [dailySeries, setDailySeries] = useState<any[]>([]);
  const [dailyXLabels, setDailyXLabels] = useState<any[]>([]);

  const [selectedDailyIntervalLength, setSelectedDailyIntervalLength] =
    useState(15);

  const [selectedTab, setSelectedTab] = useState<Tabs>(Tabs.DailySales);

  const [dailyStartDate, setDailyStartDate] = useState(
    moment().subtract(selectedDailyIntervalLength, "days")
  );
  const [dailyEndDate, setDailyEndDate] = useState(moment());
  const [
    averageIncomePerDayForCurrentPeriod,
    setAverageIncomePerDayForCurrentPeriod,
  ] = useState(0);

  const [currentYearToShow, setCurrentYearToShow] = useState(moment());
  const [monthlyChartData, setMonthlyChartData] = useState<any[]>([]);
  const [totalIncomeFromThisYear, setTotalIncomeFromThisYear] = useState(0);
  const [averagePerMonthThisYear, setAveragePerMonthThisYear] = useState(0);

  const [avgDailyProfit, setAvgDailyProfit] = useState<any>("Calculating...");

  const [incomeOverTimeData, setIncomeOverTimeData] = useState<any>([]);
  const [incomeOverTimeLabels, setIncomeOverTimeLabels] = useState<any>(null);
  const [profitOverTimeLables, setProfitOverTimeLables] = useState<any>(null);

  const [profitPerItemSeries, setProfitPerItemSeries] = useState<any>(null);

  const firstSale = props.sales
    ? props.sales.sort(
        (a, b) =>
          Number(moment(a.createdAt).format("x")) -
          Number(moment(b.createdAt).format("x"))
      )[0]
    : null;
  const firstYear = firstSale
    ? Number(moment(firstSale.createdAt).format("YYYY"))
    : 2022;

  const years = firstSale
    ? new Array(
        Number(moment().format("YYYY")) -
          Number(moment(firstSale.createdAt).format("YYYY")) +
          1
      )
        .fill(null)
        .map((_x: any, index: number) => (_x = firstYear + index))
    : [];

  let loaded = false;

  const currency = props.sales ? props.sales[0].income.currency : "";

  const loadDataForMonthlyChart = () => {
    const salesThisYear = props.sales
      ? props.sales.filter(
          (x) =>
            moment(x.createdAt).format("YYYY") ===
            currentYearToShow.format("YYYY")
        )
      : [];

    const januarySales = salesThisYear.filter(
      (x) => moment(x.createdAt).format("MMMM") === "January"
    );
    const februarySales = salesThisYear.filter(
      (x) => moment(x.createdAt).format("MMMM") === "February"
    );
    const marchSales = salesThisYear.filter(
      (x) => moment(x.createdAt).format("MMMM") === "March"
    );
    const aprilSales = salesThisYear.filter(
      (x) => moment(x.createdAt).format("MMMM") === "April"
    );
    const maySales = salesThisYear.filter(
      (x) => moment(x.createdAt).format("MMMM") === "May"
    );
    const juneSales = salesThisYear.filter(
      (x) => moment(x.createdAt).format("MMMM") === "June"
    );
    const julySales = salesThisYear.filter(
      (x) => moment(x.createdAt).format("MMMM") === "July"
    );
    const augustSales = salesThisYear.filter(
      (x) => moment(x.createdAt).format("MMMM") === "August"
    );
    const septemberSales = salesThisYear.filter(
      (x) => moment(x.createdAt).format("MMMM") === "September"
    );
    const octoberSales = salesThisYear.filter(
      (x) => moment(x.createdAt).format("MMMM") === "October"
    );
    const novemberSales = salesThisYear.filter(
      (x) => moment(x.createdAt).format("MMMM") === "November"
    );
    const decemberSales = salesThisYear.filter(
      (x) => moment(x.createdAt).format("MMMM") === "December"
    );

    const getTotalIncomeFromMonth = (monthSales: ISale[]) => {
      return monthSales.reduce((t, c) => {
        t += c.income.cents / 100;
        return t;
      }, 0);
    };

    const data = [
      getTotalIncomeFromMonth(januarySales),
      getTotalIncomeFromMonth(februarySales),
      getTotalIncomeFromMonth(marchSales),
      getTotalIncomeFromMonth(aprilSales),
      getTotalIncomeFromMonth(maySales),
      getTotalIncomeFromMonth(juneSales),
      getTotalIncomeFromMonth(julySales),
      getTotalIncomeFromMonth(augustSales),
      getTotalIncomeFromMonth(septemberSales),
      getTotalIncomeFromMonth(octoberSales),
      getTotalIncomeFromMonth(novemberSales),
      getTotalIncomeFromMonth(decemberSales),
    ];

    const incomeThisYear = data.reduce((t, c) => (t += c), 0);
    setTotalIncomeFromThisYear(incomeThisYear);
    const avgPerMonthThisYear = totalIncomeFromThisYear / 12;
    setAveragePerMonthThisYear(avgPerMonthThisYear);

    setMonthlyChartData([
      {
        data,
        label: `Total income (${currency})`,
        id: "test",
        stack: "total",
      },
    ]);
  };

  const loadDataForDailyChart = () => {
    setLoading(true);

    setDailySeries([]);
    setDailyXLabels([]);

    const colors = chroma.scale("Accent").colors(150);
    shuffleArray(colors);

    const currentDate = dailyStartDate.clone();
    let generatedSeries = generateInitialSeries(props.creations, colors);
    const xAxisLabels = [];

    const incomeForThisInterval = [];

    for (let counter = 0; counter <= selectedDailyIntervalLength; counter++) {
      const salesThisDay = props.sales
        ? props.sales.filter(
            (sale: ISale) =>
              moment(sale.createdAt).format(DEFAULT_MOMENT_FORMAT) ===
              currentDate.format(DEFAULT_MOMENT_FORMAT)
          )
        : [];
      incomeForThisInterval.push(
        salesThisDay.reduce((t, c) => (t += c.income.cents / 100), 0)
      );

      generatedSeries.forEach((serie) => {
        const salesOfThisItemThisDay = salesThisDay.filter(
          (sale) => sale.creation.name === serie.label
        );
        if (salesOfThisItemThisDay.length === 0) {
          serie.data.push(0);
        } else {
          const totalProfitMadeForThisItemOnThisDay =
            salesOfThisItemThisDay.reduce((t, c) => {
              t += c.income.cents;
              return t;
            }, 0);
          serie.data.push(totalProfitMadeForThisItemOnThisDay / 100);
        }
      });
      xAxisLabels.push(
        currentDate.format("MMMM").slice(0, 3) + " " + currentDate.format("D")
      );

      currentDate.add(1, "days");
    }

    console.log("incomeForThisInterval", incomeForThisInterval);

    const totalForThisPeriod = incomeForThisInterval.reduce(
      (t, c) => (t += c),
      0
    );

    setAverageIncomePerDayForCurrentPeriod(
      totalForThisPeriod / incomeForThisInterval.length
    );

    generatedSeries = generatedSeries.filter(
      (s) => !s.data.every((x: number) => x === 0)
    );

    setDailySeries(generatedSeries);
    setDailyXLabels(xAxisLabels);
    setLoading(false);
  };

  useEffect(() => {
    if (!loaded) {
      loaded = true;

      incomeOverTimeWorker.onmessage = function (e) {
        console.log("MESSAGE RECEIEVED FROM WORKER 1:");
        console.log(e.data);

        if (props.sales) {
          const firstSale = props.sales.sort(
            (a, b) =>
              Number(moment(a.createdAt).format("x")) -
              Number(moment(b.createdAt).format("x"))
          )[0];
          const startDate = moment(firstSale.createdAt);

          const daysPassedSinceFirstSale = Math.abs(
            moment().diff(startDate, "days")
          );

          const numberToDivideBy = Math.ceil(daysPassedSinceFirstSale / 200);

          const filteredProfitOverTimeData = e.data.profitOverTime.filter(
            (_x: any, i: number) =>
              i % numberToDivideBy === 0 ||
              i === e.data.profitOverTime.length - 1 || // dont filter away the last one
              i === 0 // dont filter away the first one
          );

          const data = filteredProfitOverTimeData.map(
            (x: any) => (x = Number(x.moneyMadeSoFar))
          );

          setProfitOverTimeLables(
            new Array(data.length)
              .fill(null)
              .map((_x, i) => filteredProfitOverTimeData[i].currentDate)
          );

          setIncomeOverTimeLabels(
            new Array(data.length).fill(null).map((_x, i) => (_x = i + 1))
          );
          setIncomeOverTimeData([
            {
              data,
              label: `Income ${currency}`,
              id: "Income",
              curve: "linear",
              showMark: () => false,
              valueFormatter: (v: any) =>
                v === null ? "" : `${round(v)} ${currency}`,
            },
          ]);
        }

        setLoadingProfitOverTime(false);
      };

      setLoadingProfitOverTime(true);
      incomeOverTimeWorker.postMessage({
        msg: "initProfitOverTime",
        sales: props.sales,
      });

      profitByDayWorker.onmessage = function (e) {
        console.log("MESSAGE RECEIEVED FROM WORKER 2:");
        console.log(e.data);
        setAvgDailyProfit(`${round(e.data.avgPerDay)} ${currency}`);
      };

      profitByDayWorker.postMessage({
        msg: "initAverageCount",
        sales: props.sales,
      });

      loadDataForDailyChart();
      loadDataForMonthlyChart();

      const profitPerItemData = props.creations
        .filter((x) => x.totalSalesAmountAfterCut.cents > 0)
        .sort(
          (a, b) =>
            b.totalSalesAmountAfterCut.cents - a.totalSalesAmountAfterCut.cents
        )
        .slice(0, 100)
        .map((c, index) => ({
          id: index,
          value: c.totalSalesAmountAfterCut.cents / 100,
          label: c.name,
        }));

      const totalProfit = props.sales
        ? props.sales.reduce((t, c) => (t += c.income.cents / 100), 0)
        : 0;
      setProfitPerItemSeries([
        {
          data: profitPerItemData,
          innerRadius: 0,
          paddingAngle: 0.1,
          cornerRadius: 10,
          valueFormatter: (v: any) =>
            v === null ? "" : `${round(Number(v.value))} ${currency}`,
          arcLabel: (item: any) =>
            `${round((item.value / totalProfit) * 100)}%`,
          arcLabelMinAngle: 15,
          highlightScope: { fade: "global", highlight: "item" },
          faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
        },
      ]);
    }
  }, []);

  useEffect(() => {
    loadDataForDailyChart();
  }, [
    selectedDailyIntervalLength,
    dailyStartDate,
    averageIncomePerDayForCurrentPeriod,
  ]);

  useEffect(() => {
    loadDataForMonthlyChart();
  }, [currentYearToShow, averagePerMonthThisYear, totalIncomeFromThisYear]);

  const CustomItemTooltipContent = (props: any) => {
    const seriesForThisDay: any[] = [];
    dailySeries.forEach((x) => {
      if (x.data[props.itemData.dataIndex] > 0) {
        seriesForThisDay.push({
          label: x.label,
          value: x.data[props.itemData.dataIndex],
          color: x.color,
        });
      }
    });

    seriesForThisDay.sort((a, b) => b.value - a.value);

    let totalIncomeThisDay = seriesForThisDay.reduce((t, c) => {
      t += c.value;
      return t;
    }, 0);
    totalIncomeThisDay = round(totalIncomeThisDay);

    return (
      <Paper sx={{ padding: 1 }}>
        <div style={{ fontSize: "1.1em", fontWeight: "bold" }}>
          Sales on {dailyXLabels[props.itemData.dataIndex]}
        </div>
        <div>
          {seriesForThisDay.map((x, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                gap: "8px",
                fontSize: "0.9em",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <div
                  style={{
                    borderRadius: "50%",
                    background: x.color,
                    width: "10px",
                    height: "10px",
                  }}
                />
                <span>{x.label}</span>
              </div>
              <div>
                {round(x.value)} {currency}
              </div>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              gap: "8px",
              fontSize: "0.9em",
              borderTop: "1px solid black",
              marginTop: "4px",
              paddingTop: "4px",
            }}
          >
            <div style={{ fontWeight: "bold" }}>Total income this day</div>
            <div>
              {totalIncomeThisDay} {currency}
            </div>
          </div>
        </div>
      </Paper>
    );
  };

  return (
    <>
      <TabsContainer
        style={{
          marginTop: "0px",
          padding: "0",
          width: "100%",
          justifyContent: "flex-start",
          paddingLeft: "30px",
        }}
      >
        {tabs.map((t, i) => (
          <WhiteTab
            key={`whitetab-${i}`}
            className={selectedTab === t ? "selected" : ""}
            onClick={() => setSelectedTab(t)}
          >
            {t}
          </WhiteTab>
        ))}
      </TabsContainer>
      {selectedTab === Tabs.DailySales ? (
        <ChartContainer>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-start",
              gap: "4px",
              flexDirection: "column",
              padding: "20px",
              paddingBottom: "0",
            }}
          >
            <div>
              <strong>Average daily income since start:</strong>{" "}
              {avgDailyProfit}
            </div>
            <div>
              <strong>Average daily income for this interval:</strong>{" "}
              {round(averageIncomePerDayForCurrentPeriod)} {currency}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                width: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
              }}
            >
              <ChartButton
                onClick={() => {
                  loadDataForDailyChart();
                }}
              >
                Randomize new colors
              </ChartButton>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>Interval length</span>
                <Select
                  options={POSSIBLE_INTERVAL_LENGHTS_FOR_DAILY_CHART}
                  onChange={(newValue) => {
                    setDailyStartDate(
                      moment().subtract(Number(newValue), "days")
                    );
                    setSelectedDailyIntervalLength(Number(newValue));
                  }}
                  defaultValue={selectedDailyIntervalLength}
                />
                <div>
                  <Tooltip
                    title="Showing a large interval of days may impact site performance"
                    about="hej"
                    arrow
                    placement="right"
                    componentsProps={{
                      tooltip: {
                        sx: {
                          fontSize: "1.2em",
                        },
                      },
                    }}
                  >
                    <HelpIcon />
                  </Tooltip>
                </div>
              </div>
            </div>
            <div
              style={{
                width: "-webkit-fill-available",
                fontSize: "1.3em",
                display: "flex",
                justifyContent: "space-evenly",
              }}
            >
              <IntervalChangeButton
                onClick={() => {
                  setDailyStartDate(
                    dailyStartDate.subtract(selectedDailyIntervalLength, "days")
                  );
                  setDailyEndDate(
                    dailyEndDate.subtract(selectedDailyIntervalLength, "days")
                  );
                  loadDataForDailyChart();
                }}
              >
                <KeyboardDoubleArrowLeftIcon /> Previous{" "}
                {selectedDailyIntervalLength} days
              </IntervalChangeButton>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                From {dailyStartDate.format(DEFAULT_MOMENT_FORMAT)} to{" "}
                {dailyEndDate.format(DEFAULT_MOMENT_FORMAT) ===
                moment().format(DEFAULT_MOMENT_FORMAT)
                  ? "Today"
                  : dailyEndDate.format(DEFAULT_MOMENT_FORMAT)}
              </span>
              <IntervalChangeButton
                onClick={() => {
                  setDailyStartDate(
                    dailyStartDate.add(selectedDailyIntervalLength, "days")
                  );
                  setDailyEndDate(
                    dailyEndDate.add(selectedDailyIntervalLength, "days")
                  );
                  loadDataForDailyChart();
                }}
                className={
                  dailyEndDate.format(DEFAULT_MOMENT_FORMAT) ===
                  moment().format(DEFAULT_MOMENT_FORMAT)
                    ? "disabled"
                    : ""
                }
              >
                Next {selectedDailyIntervalLength} days{" "}
                <KeyboardDoubleArrowRightIcon />
              </IntervalChangeButton>
            </div>
          </div>
          <BarChart
            height={700}
            loading={loading}
            series={dailySeries}
            tooltip={{
              trigger: "item",
            }}
            xAxis={[
              {
                data: dailyXLabels,
                scaleType: "band",
              },
            ]}
            yAxis={[
              {
                label: currency,
              },
            ]}
            slotProps={{
              legend: {
                hidden: true,
              },
            }}
            slots={{
              itemContent: CustomItemTooltipContent,
            }}
            axisHighlight={{
              x: "band",
            }}
          />
        </ChartContainer>
      ) : null}
      {selectedTab === Tabs.MonthlySales ? (
        <ChartContainer>
          <div>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
                gap: "4px",
                flexDirection: "column",
                padding: "20px",
                paddingBottom: "0",
              }}
            >
              <div>
                <strong>
                  Total income made for{" "}
                  {moment(currentYearToShow).format("YYYY")}:
                </strong>{" "}
                {round(totalIncomeFromThisYear)} {currency}
              </div>
              <div>
                <strong>
                  Averge income made per month for{" "}
                  {moment(currentYearToShow).format("YYYY")}:
                </strong>{" "}
                {round(averagePerMonthThisYear)} {currency}
              </div>
            </div>
            <div
              style={{
                width: "100%",
                fontSize: "1.3em",
                display: "flex",
                marginTop: "20px",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              {years.map((x, i) => (
                <IntervalChangeButton
                  onClick={() => {
                    if (x + "" === currentYearToShow.format("YYYY")) {
                      return;
                    }
                    setCurrentYearToShow(moment(`01-01-${x}`));
                    loadDataForMonthlyChart();
                  }}
                  key={`yearsbutton-${i}`}
                  className={
                    x + "" === currentYearToShow.format("YYYY")
                      ? "selected"
                      : ""
                  }
                  style={{
                    textDecoration: "none",
                  }}
                >
                  {x}
                </IntervalChangeButton>
              ))}
            </div>
          </div>
          <BarChart
            height={700}
            loading={loading}
            xAxis={[
              {
                scaleType: "band",
                data: [
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ],
              },
            ]}
            series={monthlyChartData}
            yAxis={[
              {
                label: currency,
              },
            ]}
            slotProps={{
              legend: {
                hidden: true,
              },
            }}
          />
        </ChartContainer>
      ) : null}
      {selectedTab === Tabs.TotalIncomeOverTime ? (
        <ChartContainer>
          {loadingProfitOverTime ? (
            <div
              style={{
                marginTop: "20px",
                marginBottom: "20px",
              }}
            >
              <Loader />
            </div>
          ) : null}
          {!loadingProfitOverTime && !incomeOverTimeData ? (
            <div>No data to show</div>
          ) : null}
          {!loadingProfitOverTime && incomeOverTimeData ? (
            <LineChart
              xAxis={[
                {
                  data: incomeOverTimeLabels,
                  label: "Time",
                  valueFormatter: (v: any) =>
                    v === null ? "" : `${profitOverTimeLables[Number(v)]}`,
                },
              ]}
              series={incomeOverTimeData}
              height={700}
              slotProps={{
                legend: {
                  hidden: true,
                },
              }}
            />
          ) : null}
        </ChartContainer>
      ) : null}
      {selectedTab === Tabs.ProfitPerItem ? (
        <ChartContainer
          style={{
            padding: "30px",
          }}
        >
          <p>
            <strong>Note:</strong> The pie chart below will only show your top
            100 most profitable items. This limit is set in order to prevent
            slow site performance in case you have a huge amount of designs for
            sale
          </p>
          <PieChart
            series={profitPerItemSeries}
            height={700}
            slotProps={{
              legend: {
                hidden: true,
              },
            }}
          />
        </ChartContainer>
      ) : null}
    </>
  );
};

export default SalesCharts;
