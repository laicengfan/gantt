$(document).ready(function () {
  // 渲染根元素
  const renderBody = () => {
    let bodyTemplate = `
    <div class="model-gantt-wrap">
      <div class="model-gantt-drawer">
        <div class="model-gantt-drawer-wrap">
        </div>
        <div class="model-gantt-drawer-add">添加里程碑</div>
        <div class="model-gantt-drawer-opt active"></div>
      </div>
      <div class="model-gantt-table">
        <div class="model-gantt-table-wrap">
          <div class="model-gantt-table-content">
          </div>
        </div>
      </div>
    </div>
    `;
    $('#gantt').append(bodyTemplate);
  }; // 颜色格式转换函数


  var colorChange = (sHex, alpha = 1) => {
    // 十六进制颜色值的正则表达式
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    /* 16进制颜色转为RGB格式 */

    let sColor = sHex.toLowerCase();

    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        var sColorNew = '#';

        for (let i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
        }

        sColor = sColorNew;
      } //  处理六位的颜色值


      var sColorChange = [];

      for (let i = 1; i < 7; i += 2) {
        // 使用0x将16进制转换为10进制
        sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
      } // return sColorChange.join(',')
      // 或


      return 'rgba(' + sColorChange.join(',') + ',' + alpha + ')';
    } else {
      return sColor;
    }
  }; // 渲染表格头部（日、月）子标题列


  const renderRow = data => {
    let rows = '';
    data.map((item, index) => {
      // 如果子项数据为date
      if (item.constructor === Object) {
        rows += `<div class="${item.restFlag ? 'rest-day' : ''}"><p>${item.dateNum}</p></div>`;
      } else {
        rows += `<div><p>${item}</p></div>`;
      }
    });
    return rows;
  }; // 渲染表格头部（季度、年）子标题列


  const renderColspan = data => {
    let rows = '';
    data.map(item => {
      // 如果子项数据为date
      rows += `<div class="model-gantt-table-content-header-subtitle-colspan"><p>${item}</p></div>`;
    });
    return rows;
  }; // 渲染表格背景列


  const renderEmptyRow = data => {
    let rows = '';
    data.map(item => {
      rows += `<div></div>`;
    });
    return rows;
  }; // 渲染表格行


  const renderLine = (line, row) => {
    let lines = ''; // 遍历数据行

    line.map(item => {
      lines += `
          <div class="model-gantt-table-content-body-line">
            ${renderEmptyRow(row)}          
          </div>
        `;
    });
    return lines;
  }; // 渲染表格行(跨列)


  const renderColspanLine = (line, row) => {
    let lines = ''; // 遍历数据行

    line.map(item => {
      lines += `
          <div class="model-gantt-table-content-body-line">
            ${row.map(item => {
        let rows = '';
        return rows += `<div class="model-gantt-table-content-body-line-colspan"></div>`;
      }).join('')}      
          </div>
        `;
    });
    return lines;
  }; // 渲染表格


  const renderTable = (titleData, lineData) => {
    // 渲染季度、年等跨列表格
    if (titleData.value === 'quarter' || titleData.value === 'year') {
      titleData.content.map((item, index) => {
        let rowWidth = 0; // 如果是季度，年的首个表格，则宽度再格子数*70的基础上再+1

        if (index === 0) {
          item.subTitle.map((item, index) => {
            let rowNum = index + 1;
            rowWidth = rowNum * 70;
          });
          rowWidth += 1; // 其他表格样式宽度均为季度，年数*35
        } else {
          item.subTitle.map((item, index) => {
            let rowNum = index + 1;
            rowWidth = rowNum * 70;
          });
        }

        const tableItem = `
            <div class="model-gantt-table-content-item" style="width:${rowWidth}px">
              <div class="model-gantt-table-content-header">
                <div class="model-gantt-table-content-header-title">${item.title}</div>
                <div class="model-gantt-table-content-header-subtitle">
                 ${renderColspan(item.subTitle)}
                </div>
              </div>
              <div class="model-gantt-table-content-body">
                ${renderColspanLine(lineData, item.subTitle)}
              </div>
            </div>`;
        $('.model-gantt-table-content').append(tableItem);
      });
    } else if (titleData.value === 'date') {
      // 将日期单独做渲染因为日期表格太长，当表格在浏览器中的实际视窗宽度（浏览器的视窗宽度-左侧抽屉层的宽度）<单个日期表格的DOM宽度时，JQ的outerWidth()方法获取的宽度是浏览器剩余视窗的宽度，导致渲染出来的空表格显示异常，所以此处需要添加style的width属性，保证获取数值正常
      // 渲染日期
      titleData.content.map((item, index) => {
        let rowWidth = 0; // 如果是日期的首个表格，则宽度再格子数*35的基础上再+1

        if (index === 0) {
          item.subTitle.map((item, index) => {
            let rowNum = index + 1;
            rowWidth = rowNum * 35;
          });
          rowWidth += 1; // 其他表格样式宽度均为天数*35
        } else {
          item.subTitle.map((item, index) => {
            let rowNum = index + 1;
            rowWidth = rowNum * 35;
          });
        }

        const tableItem = `
          <div class="model-gantt-table-content-item date" style="width:${rowWidth}px">
            <div class="model-gantt-table-content-header">
              <div class="model-gantt-table-content-header-title">${item.title}</div>
              <div class="model-gantt-table-content-header-subtitle">
               ${renderRow(item.subTitle)}
              </div>
            </div>
            <div class="model-gantt-table-content-body">
              ${renderLine(lineData, item.subTitle)}
            </div>
          </div>`;
        $('.model-gantt-table-content').append(tableItem);
      });
    } else {
      // 渲染月份
      titleData.content.map((item, index) => {
        let rowWidth = 0; // 如果是月份的首个表格，则宽度再格子数*35的基础上再+1

        if (index === 0) {
          item.subTitle.map((item, index) => {
            let rowNum = index + 1;
            rowWidth = rowNum * 35;
          });
          rowWidth += 1; // 其他表格样式宽度均为月份数*35
        } else {
          item.subTitle.map((item, index) => {
            let rowNum = index + 1;
            rowWidth = rowNum * 35;
          });
        }

        const tableItem = `
            <div class="model-gantt-table-content-item" style="width:${rowWidth}px">
              <div class="model-gantt-table-content-header">
                <div class="model-gantt-table-content-header-title">${item.title}</div>
                <div class="model-gantt-table-content-header-subtitle">
                 ${renderRow(item.subTitle)}
                </div>
              </div>
              <div class="model-gantt-table-content-body">
                ${renderLine(lineData, item.subTitle)}
              </div>
            </div>`;
        $('.model-gantt-table-content').append(tableItem);
      });
    }
  }; // 渲染任务行，progressData：任务进度的集合，calibration：当前的时间轴单位日/月/季度/年


  const renderProgress = (progressData, calibration) => {
    let progress = ''; // 按日渲染

    const renderDateProgress = (progressVal, progressDate) => {
      progressVal.map((item, index) => {
        // 渲染任务进度条的长度
        // 分割时间字符串转换为数组'2020/11/05' => ['2020','11','05']
        let startTime = item.lineContent.start.split('/');
        let endTime = item.lineContent.end.split('/'); // new Date()第3个参数默认为1，就是每个月的1号，把它设置为0时， new Date()会返回本月的最后一天，然后通过getDate()方法得到天数

        let curStartDate = new Date(startTime[0], startTime[1] - 0, 0).getDate(); // 开始任务的日期至当月结束日期的时间段

        let remainStartDate = curStartDate + 1 - startTime[2]; // 中间时间段（跨月/年）

        let plusDate = 0; // 总时间跨度(占据的格子数)

        let timeNum = 0; // console.log(startTime, endTime)
        // 时间跨度没跨年

        if (startTime[0] === endTime[0]) {
          // 没跨月
          if (startTime[1] === endTime[1]) {
            timeNum = parseInt(endTime[2]) + 1 - startTime[2]; // 跨月
          } else {
            // 时间跨度 = 本月开始时间至月末的时间段 + 中间月份的天数 + 结束时间所在月份需要的天数，
            // 开始与结束的月份，中间相差的几个月的天数总和
            // 若中间月份的天数plusDate = 0，则表示跨的月份为相邻的2个月
            for (let i = startTime[1] - 0 + 1; i < endTime[1]; i++) {
              plusDate += new Date(startTime[0], i, 0).getDate();
            }

            timeNum = remainStartDate + plusDate + (endTime[2] - 0);
          } // 时间跨年

        } else {
          // 天数总和 = remainStartDate + 任务开始时间的后一个月至开始时间年份最后一天的时间段 + 年份所差的天数总和 + 结束时间年份的1月1日至结束时间的时间段
          // 开始时间的下一个月至当年年尾的天数总和
          for (let i = startTime[1] - 0 + 1; i <= 12; i++) {
            plusDate += new Date(startTime[0], i, 0).getDate();
          } // 中间相差的年数的天数总和


          for (let i = endTime[0] - 1; i > startTime[0]; i--) {
            // 判断平年闰年
            if (i % 4 === 0) {
              plusDate += 366;
            } else {
              plusDate += 365;
            }
          } // 结束时间所在年份的1月1日至结束时间，中间月份的天数总和


          for (let i = 1; i < endTime[1]; i++) {
            plusDate += new Date(endTime[0], i, 0).getDate();
          }

          timeNum = remainStartDate + plusDate + (endTime[2] - 0);
        } // console.log('时间跨度', timeNum)
        // 起始时间与表格位置绑定
        // 起始年/月/日


        const leftStartYear = progressDate.content[0].title.split('年')[0];
        const leftStartMonth = progressDate.content[0].title.split('年')[1].split('月')[0];
        const leftStartDate = progressDate.content[0].subTitle[0].dateNum; // 起始日到起始日所在月份月底的时间段

        const leftRemainDate = new Date(leftStartYear, leftStartMonth, 0).getDate() - leftStartDate + 1; // console.log('起始日到起始日所在月份月底的时间段',leftRemainDate)
        // 任务条左偏移的格子数

        let progressLeft = 0; // 任务条左偏移的时间段天数

        let leftPlusDate = 0; // 当前任务起始时间与最早任务的起始时间在同一年

        if (startTime[0] === leftStartYear) {
          // 当前任务起始时间与最早任务的起始时间在同一月
          if (startTime[1] === leftStartMonth) {
            // 左偏移从结尾时间点开始，所以不需要+1
            progressLeft = startTime[2] - leftStartDate; // 当前任务起始时间与最早任务的起始时间不在同一月
          } else {
            // 左偏移 = 最早任务开始的日期 + 最早任务开始日期的下一个月至当前任务开始日期的上一个月中间相差的月份天数总和 + 当前任务开始的日期-1
            // 若中间的差值leftPlusDate = 0，则说明2个任务开始时间为相邻的2个月
            for (let i = leftStartMonth - 0 + 1; i < startTime[1]; i++) {
              leftPlusDate += new Date(startTime[0], i, 0).getDate();
            }

            progressLeft = leftRemainDate + leftPlusDate + (startTime[2] - 1);
          } // 当前任务起始时间与最早任务的起始时间不在同一年

        } else {
          // 左偏移 = 最早任务开始的日期 + 最早任务开始日期的下一个月至当前任务开始日期的上一个月中间相差的月份天数总和 + 当前任务开始的日期-1
          // 中间相差年数所包含的天数
          for (let i = startTime[0] - 1; i > leftStartYear - 0; i--) {
            // 判断平年闰年
            if (i % 4 === 0) {
              leftPlusDate += 366;
            } else {
              leftPlusDate += 365;
            }
          } // 最早任务开始月份的后一月至那年年末月份数的天数总和，若最早开始任务的月份为11月，则plusDate不会计算


          for (let i = leftStartMonth - 0 + 1; i <= 12; i++) {
            leftPlusDate += new Date(startTime[0], i, 0).getDate();
          } // 下一年的1月1日至任务开始时间月份的前一个月的天数总和，如果任务恰好在1月开始，则plusDate不会计算，仍然为0


          for (let i = 1; i < startTime[1]; i++) {
            leftPlusDate += new Date(endTime[0], i, 0).getDate();
          }

          progressLeft = leftRemainDate + leftPlusDate + (startTime[2] - 0 - 1);
        } // console.log('渲染时的宽度',timeNum * 35)
        // console.log('最初左偏移时间段', leftRemainDate)
        // console.log('中间时间段', leftPlusDate)
        // console.log('左偏移的格子数开始时间是10月2日', progressLeft)


        progress += `
      <div class="model-gantt-table-mask-progress-item date" index="${index}" style="width:0px;margin-left:${progressLeft * 35}px">
        <div class="model-gantt-table-mask-progress-item-soon" style="background:${colorChange(item.background, .5)};">
          <p class="model-gantt-table-mask-progress-item-desc">${item.lineContent.desc}</p>
          <div class="model-gantt-table-mask-progress-item-done" style="width:0px;background:${colorChange(item.background)}"></div>
          <div class="model-gantt-table-mask-progress-item-shadow" style="background:${colorChange(item.background, .3)};"></div>
        </div>
      </div>
      `; // 进度条动效

        setTimeout(function () {
          let progressDom = $('.model-gantt-table-mask-progress-item');
          $(progressDom[index]).css('width', `${timeNum * 35}px`);
          $(progressDom[index]).find('.model-gantt-table-mask-progress-item-done').css('width', `${timeNum * 35 * item.lineContent.progress}px`);
        }, 100);
      });
      progress = `
    <div class="model-gantt-table-mask">
      <div class="model-gantt-table-mask-progress">
        ${progress}
      </div>
    </div>`;
    }; // 按月份渲染


    const renderMonthProgress = (progressVal, progressMonth) => {
      // console.log(progressMonth)
      progressVal.map((item, index) => {
        // 渲染任务进度条的长度
        // 分割时间字符串转换为数组'2020/11/05' => ['2020','11','05']
        let startTime = item.lineContent.start.split('/');
        let endTime = item.lineContent.end.split('/'); // console.log(startTime, endTime)
        // 开始任务的月份至当年12月所包含的月份数

        let remainStartMonth = 12 - startTime[1] + 1; // 结束任务所在年份的1月至结束任务的月所包含的月份数

        let remainEndMonth = endTime[1] - 0; // 中间时间段（跨月/年）

        let plusMonth = 0; // 总时间跨度(占据的格子数)

        let timeNum = 0;

        if (startTime[0] === endTime[0]) {
          timeNum = endTime[1] - startTime[1] + 1; // 时间跨度跨年
        } else {
          // 中间相差的年数包含的月份总和
          for (let i = endTime[0] - 1; i > startTime[0]; i--) {
            plusMonth += 12;
          }

          timeNum = remainStartMonth + plusMonth + remainEndMonth;
        } // console.log('按月份的时间跨度',timeNum)
        // 起始时间与表格位置绑定
        // 起始年/月


        const leftStartYear = progressMonth.content[0].title.slice(0, 4);
        const leftStartMonth = parseInt(progressMonth.content[0].subTitle[0]); // 任务条左偏移的格子数

        let progressLeft = 0; // 任务条左偏移的时间段月份数

        let leftPlusMonth = 0; // 起始月到起始月所在年末的月份总和

        const leftRemainMonth = 12 - leftStartMonth; // 当前任务起始时间与最早任务的起始时间在同一年

        if (startTime[0] === leftStartYear) {
          progressLeft = startTime[1] - leftStartMonth; // 当前任务起始时间与最早任务的起始时间不在同一年
        } else {
          // 中间相差的年数包含的月份总和
          for (let i = startTime[0] - 1; i > leftStartYear; i--) {
            leftPlusMonth += 12;
          }

          progressLeft = leftRemainMonth + leftPlusMonth + (startTime[1] - 0);
        }

        progress += `
      <div class="model-gantt-table-mask-progress-item" index="${index}" style="width:0;margin-left:${progressLeft * 35}px">
        <div class="model-gantt-table-mask-progress-item-soon" style="background:${colorChange(item.background, .5)};">
          <p class="model-gantt-table-mask-progress-item-desc">${item.lineContent.desc}</p>
          <div class="model-gantt-table-mask-progress-item-done" style="width:0px;background:${colorChange(item.background)}"></div>
          <div class="model-gantt-table-mask-progress-item-shadow" style="background:${colorChange(item.background, .3)};"></div>
        </div>
      </div>
      `; // 进度条动效

        setTimeout(function () {
          let progressDom = $('.model-gantt-table-mask-progress-item');
          $(progressDom[index]).css('width', `${timeNum * 35}px`);
          $(progressDom[index]).find('.model-gantt-table-mask-progress-item-done').css('width', `${timeNum * 35 * item.lineContent.progress}px`);
        }, 100);
      });
      progress = `
    <div class="model-gantt-table-mask">
      <div class="model-gantt-table-mask-progress">
        ${progress}
      </div>
    </div>`;
    }; // 按季度渲染


    const renderQuarterProgress = (progressVal, progressQuarter) => {
      progressVal.map((item, index) => {
        // 渲染任务进度条的长度
        // 分割时间字符串转换为数组'2020/11/05' => ['2020','11','05']
        let startTime = item.lineContent.start.split('/');
        let endTime = item.lineContent.end.split('/'); // 开始任务的月份至当年12月所包含季度数

        let remainStartQuarter = parseInt((12 - startTime[1]) / 3 + 1); // 结束任务所在年份的1月至结束任务的月所包含的季度数

        let remainEndQuarter = parseInt((endTime[1] - 1) / 3 + 1); // 中间时间段（跨季度/年）

        let plusQuarter = 0; // 总时间跨度(占据的格子数)

        let timeNum = 0; // 时间跨度没跨年

        if (startTime[0] === endTime[0]) {
          // 时间跨度 = 任务经过的时间段/3（按季度划分） + 1，然后进一法取整
          timeNum = parseInt((endTime[1] - startTime[1]) / 3 + 1); // 时间跨度跨年
        } else {
          // 中间相差的年数包含的季度数总和
          for (let i = endTime[0] - 1; i > startTime[0]; i--) {
            plusQuarter += 4;
          }

          timeNum = remainStartQuarter + plusQuarter + remainEndQuarter;
        } // console.log('总时间跨度',timeNum)
        // 起始时间与表格位置绑定
        // 起始年/季度


        const leftStartYear = progressQuarter.content[0].title.slice(0, 4);
        const leftStartWord = progressQuarter.content[0].subTitle[0]; // 将汉字季度转义为数字

        let leftStartQuarter = 0;

        switch (leftStartWord[0]) {
          case '一':
            leftStartQuarter = 1;
            break;

          case '二':
            leftStartQuarter = 2;
            break;

          case '三':
            leftStartQuarter = 3;
            break;

          case '四':
            leftStartQuarter = 4;
            break;
        } // 任务条左偏移的格子数


        let progressLeft = 0; // 任务条左偏移的季度数

        let leftPlusQuarter = 0; // 最早起始季到所在年末的季度总和

        const leftRemainQuarter = 5 - leftStartQuarter; // 当前任务的起始季度

        const curStartQuarter = parseInt((startTime[1] - 1) / 3 + 1); // 当前任务起始时间与最早任务的起始时间在同一年

        if (startTime[0] === leftStartYear) {
          progressLeft = curStartQuarter - leftStartQuarter; // 当前任务起始时间与最早任务的起始时间不在同一年
        } else {
          // 中间相差的年数包含的季度数总和
          for (let i = startTime[0] - 1; i > leftStartYear; i--) {
            leftPlusQuarter += 4;
          } // 左偏移 = 最早起始任务至那年年尾包含的季度数总和 + 中间所跨年份包含的季度数总和 + 当前任务的开始季度数-1


          progressLeft = leftRemainQuarter + leftPlusQuarter + curStartQuarter - 1;
        }

        progress += `
      <div class="model-gantt-table-mask-progress-item" index="${index}" style="width:0px;margin-left:${progressLeft * 70}px">
        <div class="model-gantt-table-mask-progress-item-soon" style="background:${colorChange(item.background, .5)};">
          <p class="model-gantt-table-mask-progress-item-desc">${item.lineContent.desc}</p>
          <div class="model-gantt-table-mask-progress-item-done" style="width:0px;background:${colorChange(item.background)}"></div>
          <div class="model-gantt-table-mask-progress-item-shadow" style="background:${colorChange(item.background, .3)};"></div>
        </div>
      </div>
      `; // 进度条动效

        setTimeout(function () {
          let progressDom = $('.model-gantt-table-mask-progress-item');
          $(progressDom[index]).css('width', `${timeNum * 70}px`);
          $(progressDom[index]).find('.model-gantt-table-mask-progress-item-done').css('width', `${timeNum * 70 * item.lineContent.progress}px`);
        }, 100);
      });
      progress = `
    <div class="model-gantt-table-mask">
      <div class="model-gantt-table-mask-progress">
        ${progress}
      </div>
    </div>`;
    }; // 按年份渲染


    const renderYearProgress = (progressVal, progressYear) => {
      progressVal.map((item, index) => {
        // 渲染任务进度条的长度
        // 分割时间字符串转换为数组'2020/11/05' => ['2020','11','05']
        let startTime = item.lineContent.start.split('/');
        let endTime = item.lineContent.end.split('/'); // console.log(startTime, endTime)
        // 开始任务的月份至当年12月所包含半年数

        let remainStartYear = parseInt((12 - startTime[1]) / 6 + 1); // 结束任务所在年份的1月至结束任务的月所包含的半年

        let remainEndYear = parseInt((endTime[1] - 1) / 6 + 1); // 中间时间段（跨季度/年）

        let plusYear = 0; // 总时间跨度(占据的格子数)

        let timeNum = 0; // 时间跨度没跨年

        if (startTime[0] === endTime[0]) {
          // 时间跨度 = 任务经过的时间段/6（按上/下半年划分） + 1，然后进一法取整
          timeNum = parseInt((endTime[1] - startTime[1]) / 6 + 1); // 时间跨度跨年
        } else {
          // 中间相差的年数包含的年数总和
          for (let i = endTime[0] - 1; i > startTime[0]; i--) {
            plusYear += 2;
          }

          timeNum = remainStartYear + plusYear + remainEndYear;
        } // 起始时间与表格位置绑定
        // 起始年/季度


        const leftStartYear = progressYear.content[0].title.slice(0, 4);
        const leftStartWord = progressYear.content[0].subTitle[0]; // 将汉字上下半年转义为数字

        let leftNumYear = 0;

        switch (leftStartWord[0]) {
          case '上':
            leftNumYear = 1;
            break;

          case '下':
            leftNumYear = 2;
            break;
        } // 任务条左偏移的格子数


        let progressLeft = 0; // 任务条左偏移的季度数

        let leftPlusYear = 0; // 最早时间起始的半年到所在年末的半年数总和

        const leftRemainYear = 3 - leftNumYear; // 当前任务的起始半年数

        const curStartYear = parseInt((startTime[1] - 1) / 6 + 1); // 当前任务起始时间与最早任务的起始时间在同一年

        if (startTime[0] === leftStartYear) {
          progressLeft = curStartYear - leftNumYear; // 当前任务起始时间与最早任务的起始时间不在同一年
        } else {
          // 中间相差的年数包含的半年数总和
          for (let i = startTime[0] - 1; i > leftStartYear; i--) {
            leftPlusYear += 2;
          } // 左偏移 = 最早起始任务至那年年尾包含的半年数总和 + 中间所跨年份包含的半年数总和 + 当前任务的开始半年数-1


          progressLeft = leftRemainYear + leftPlusYear + curStartYear - 1;
        }

        progress += `
      <div class="model-gantt-table-mask-progress-item" index="${index}" style="width:0px;margin-left:${progressLeft * 70}px">
        <div class="model-gantt-table-mask-progress-item-soon" style="background:${colorChange(item.background, .5)};">
          <p class="model-gantt-table-mask-progress-item-desc">${item.lineContent.desc}</p>
          <div class="model-gantt-table-mask-progress-item-done" style="width:0px;background:${colorChange(item.background)}"></div>
          <div class="model-gantt-table-mask-progress-item-shadow" style="background:${colorChange(item.background, .3)};"></div>
        </div>
      </div>
      `; // 进度条动效

        setTimeout(function () {
          let progressDom = $('.model-gantt-table-mask-progress-item');
          $(progressDom[index]).css('width', `${timeNum * 70}px`);
          $(progressDom[index]).find('.model-gantt-table-mask-progress-item-done').css('width', `${timeNum * 70 * item.lineContent.progress}px`);
        }, 100);
      });
      progress = `
    <div class="model-gantt-table-mask">
      <div class="model-gantt-table-mask-progress">
        ${progress}
      </div>
    </div>`;
    }; // 确认时间轴为日期/月份/季度/年，以显示对应任务条进度的长度


    switch (calibration.value) {
      case 'date':
        renderDateProgress(progressData, calibration);
        break;

      case 'month':
        renderMonthProgress(progressData, calibration);
        break;

      case 'quarter':
        renderQuarterProgress(progressData, calibration);
        break;

      case 'year':
        renderYearProgress(progressData, calibration);
        break;
    }

    $('.model-gantt-table-wrap').prepend(progress);
  }; // 渲染抽屉层


  const renderDrawer = drawerData => {
    let dTable = '';
    let dTableHeader = `
    <td>
      <div class="model-gantt-checkbox select-all">
        <div class="model-gantt-checkbox-wrap">
          <input type="checkbox">
          <span class="model-gantt-checkbox-inner"></span>
        </div>
      </div>
    </td>
    <td class="model-gantt-drawer-table-setting">
      <div></div>
    </td>`;
    let dTableBody = ''; // 渲染抽屉头部

    drawerData.missionTitle.map(item => {
      dTableHeader += `
        <td>
          <div>${item.title}</div>
        </td>
      `;
    }); // 包装抽屉表格头部

    dTableHeader = `
      <thead>
        <tr>${dTableHeader}</tr>
      </thead>
    `; // 渲染抽屉内容

    drawerData.missionContent.map((item, index) => {
      // console.log(item.displayItem)
      dTableBody += `
        <tr fdId=${item.fdId}>
          <td>
            <div class="model-gantt-checkbox">
              <div class="model-gantt-checkbox-wrap">
                <input type="checkbox" id=${index}">
                <span class="model-gantt-checkbox-inner"></span>
              </div>
            </div>
          </td>
          <td>
            <div class="model-gantt-checkbox-num">
              <i style="background:${item.background}"></i>
              <span class="model-gantt-checkbox-desc">${index + 1}</span>
            </div>
          </td>
          ${item.displayItem.map(aItem => {
        return `<td>${aItem.itemDesc}</td>`;
      }).join('')}
        </tr>
      `;
    }); // 包装表格内容

    dTableBody = `
      <tbody>
        ${dTableBody}
      </tbody>
    `; // 包装表格

    dTable = `
      <table>
        ${dTableHeader}
        ${dTableBody}
      </table>
    `;
    $('.model-gantt-drawer-wrap').prepend(dTable);
  }; // 渲染筛选面板


  const renderFilterPanel = filterVal => {
    let filterPanel = '';
    filterVal.map((item, index) => {
      filterPanel += `
      <li class="model-gantt-drawer-setting-item">
        <div class="model-gantt-checkbox">
          <div class="model-gantt-checkbox-wrap checked">
            <input type="checkbox" id=${index} checked="true">
            <span class="model-gantt-checkbox-inner"></span>
          </div>
          <span class="model-gantt-checkbox-desc">${item.title}</span>
        </div>
      </li>
      `;
    });
    filterPanel = `
    <ul class="model-gantt-drawer-setting">
      ${filterPanel}
    </ul>
    `;
    $('.model-gantt-drawer').append(filterPanel);
  }; // 渲染定位条


  const renderPositionElement = timeVal => {
    // 日期与月份渲染的定位条
    if (timeVal.value === 'date' || timeVal.value === 'month') {
      const positionElement = `
      <div class="model-gantt-table-current">
        <div class="model-gantt-table-currentX"></div>
        <div class="model-gantt-table-currentY"></div>
      </div>
    `;
      $('.model-gantt-table-wrap').prepend(positionElement); // 季度与年渲染的定位条
    } else {
      const positionElement = `
      <div class="model-gantt-table-current">
        <div class="model-gantt-table-currentX"></div>
        <div class="model-gantt-table-currentYMax"></div>
      </div>
    `;
      $('.model-gantt-table-wrap').prepend(positionElement);
    }
  }; // 进度条弹窗


  const renderMsgMask = () => {
    const msgMask = `
    <div class="model-gantt-table-msg">
      <div class="model-gantt-table-msg-title"><p></p><i></i></div>
      <ul class="model-gantt-table-msg-content">
        <li class="model-gantt-table-msg-content-item">
          <div class="model-gantt-table-msg-content-start"><p>开始：</p><span></span></div>
          <div class="model-gantt-table-msg-content-end"><p>结束：</p><span></span></div>
          <div class="model-gantt-table-msg-content-percent"><p>进度：</p><span></span></div>
          <div class="model-gantt-table-msg-content-link"><p>跳转</p></div>
        </li>
      </ul>
    </div>
    `;
    $('.model-gantt-table-wrap').append(msgMask);
    $('.model-gantt-table-msg').on('click', 'i', function () {
      $('.model-gantt-table-msg').removeClass('active');
    });
  }; // 设置表格容器总宽度(Todo: 子元素宽度超过视窗宽度时，outterWidth获取宽度会不正常，将JQ对象改为DOM对象获取的宽度也不正常，暂时在css中给父元素添加最小宽度解决问题)


  const calculateWidth = () => {
    var tableItems = $('.model-gantt-table-content-item');
    var tableItemWidth = 0; // console.log(tableItems)

    tableItems.each(function () {
      tableItemWidth += $(this).outerWidth(); // console.log('获取表格DOM宽',$(this).outerWidth())
      // console.log('获取表格DOM的css宽',$(this).css('width'))
    });
    $('.model-gantt-table-wrap').css({
      width: tableItemWidth
    });
  }; // 操作抽屉层


  const operateDrawer = () => {
    $('.model-gantt-drawer-opt').on('click', function () {
      let drawerWidth = $('.model-gantt-drawer').outerWidth();
      $(this).toggleClass('active'); // 抽屉层被收起，右侧表格被释放

      if ($(this).attr('class').indexOf('active') === -1) {
        $('.model-gantt-drawer-setting').removeClass('active');
        $('.model-gantt-drawer').css({
          marginLeft: -drawerWidth
        }); // 抽屉层被拉出，右侧表格被压缩
      } else {
        $('.model-gantt-drawer').css({
          marginLeft: 0
        });
      }
    });
  }; // 鼠标移动定位交互


  const mousePosition = () => {
    $('.model-gantt-table-mask-progress').on('mousemove', function (e) {
      // console.log(e.target)
      // console.log('e的offsetX================',e.offsetX)
      // 在表格里滑动时再显示定位条
      $('.model-gantt-table-current').addClass('active'); // 鼠标获取X轴上的格子数

      let xNum = parseInt(e.offsetX / 35); // 跨列的格子数

      let xNumMax = parseInt(e.offsetX / 70); // 鼠标获取Y轴上的格子数

      let yNum = parseInt(e.offsetY / 35) + 1; // 当前定位的X，Y轴变蓝色

      let positionX = xNum * 35; // 跨列的X定位

      let positionXMax = xNumMax * 70;
      let positionY = yNum * 35 + 36; // 定位到父元素取margin-left

      let parentLeft = parseInt($(e.target).parents(".model-gantt-table-mask-progress-item").css('margin-left')); // 直接取到本元素的margin-left

      let itemLeft = parseInt($(e.target).css('margin-left')); // 日期标识

      let dateFlag = e.target.getAttribute('class');
      $('.model-gantt-table-currentX').css({
        top: positionY
      });
      $('.model-gantt-table-currentY').css({
        left: positionX
      }); // 跨列单元格定位

      $('.model-gantt-table-currentYMax').css({
        left: positionXMax
      }); // 当移动到任务条时，鼠标事件e的触发源被改变

      if (e.target.getAttribute('class') === 'model-gantt-table-mask-progress-item-desc' || e.target.getAttribute('class') === 'model-gantt-table-mask-progress-item-shadow') {
        let progressItemY = $(e.target).parents(".model-gantt-table-mask-progress-item").attr('index') - 0 + 1;
        $('.model-gantt-table-currentX').css({
          top: progressItemY * 35 + 36
        });
        $('.model-gantt-table-currentY').css({
          left: parentLeft + (positionX - 0 * 35)
        }); // 跨列单元格定位

        $('.model-gantt-table-currentYMax').css({
          left: parentLeft + positionXMax
        }); // console.log('soon',parentLeft,positionXMax)
      } else if (e.target.getAttribute('class') === 'model-gantt-table-mask-progress-item' || dateFlag) {
        let progressItemY = $(e.target).attr('index') - 0 + 1;
        $('.model-gantt-table-currentX').css({
          top: progressItemY * 35 + 36
        });
        $('.model-gantt-table-currentY').css({
          left: itemLeft + (positionX - 0 * 35)
        }); // 跨列单元格定位

        $('.model-gantt-table-currentYMax').css({
          left: itemLeft + positionXMax
        }); // console.log('item',itemLeft,positionXMax)
      }
    });
  }; // 点击任务进度，更改弹出提示窗的信息


  const alertMsg = () => {
    // 任务数据的最大值
    let maxIndex = missionData.missionContent.length; // 当前被点击任务的索引

    let msgIndex = 0;
    $('.model-gantt-table-mask-progress-item').on('click', function (e) {
      // console.log(e.clientY)
      // console.log('===', e.offsetX)
      msgIndex = $(this).attr('index'); // 提示窗标题

      let msgTitle = missionData.missionContent[msgIndex].lineContent.desc; // 开始时间

      let startTime = missionData.missionContent[msgIndex].lineContent.start; // 结束时间

      let endTime = missionData.missionContent[msgIndex].lineContent.end; // 进度，toFixed解决浮点计算精度丢失导致的计算异常问题

      let progressPercent = (missionData.missionContent[msgIndex].lineContent.progress * 100).toFixed(2); // 进度条左偏移数值

      let itemLeft = parseInt($(this).css('margin-left'));
      $('.model-gantt-drawer-setting').removeClass('active'); // 修改提示窗信息

      $('.model-gantt-table-msg-title p').html(msgTitle);
      $('.model-gantt-table-msg-content-start span').html(`${startTime}`);
      $('.model-gantt-table-msg-content-end span').html(`${endTime}`);
      $('.model-gantt-table-msg-content-percent span').html(`${progressPercent}%`); // 显示提示窗，修改显示位置

      $('.model-gantt-table-msg').addClass('active'); // 保证数据少的时候，弹出面板能正常显示，将定位改为fixed定位后，需要判断抽屉层是否展开，决定左偏移的值

      if (maxIndex - msgIndex > 4) {
        $('.model-gantt-table-msg').css({
          left: e.clientX,
          top: e.clientY
        }); // 如果弹出窗口在最后3条数据上，弹出窗口的位置靠上偏移
      } else {
        $('.model-gantt-table-msg').css({
          left: e.clientX,
          top: e.clientY - 3 * 35
        });
      }
    }); // 点击跳转跳转页面

    $('.model-gantt-table-msg-content-link p').on('click', function () {
      // 进度条对应的ID值
      let itemLink = missionData.missionContent[msgIndex].fdId;
      console.log(itemLink);
    });
  };

  const publicBehavior = () => {
    // 多选公共逻辑
    $('.model-gantt-checkbox-desc').on('click', function () {
      $(this).siblings().toggleClass('checked');
    });
    $('.model-gantt-checkbox-wrap input').on('click', function () {
      $(this).parent().toggleClass('checked');
    }); // 点击抽屉层筛选条件，改变抽屉层内容

    $('.model-gantt-drawer-table-setting').on('click', function () {
      $('.model-gantt-drawer-setting').toggleClass('active');
    });
    $('.model-gantt-table-mask-progress').on('click', function () {
      $('.model-gantt-drawer-setting').removeClass('active');
    });
  }; // 点击label隐藏/显示表格列


  const clickFilter = () => {
    $('.model-gantt-drawer-setting .model-gantt-checkbox-desc').on('click', function () {
      // 当前被点击的DOM索引
      let curIndex = $(this).parents('.model-gantt-drawer-setting-item').index(); // 选中标识

      let checkedFlag = $(this).siblings().attr('class').indexOf('checked'); // 与被点击DON索引相同的抽屉头部列

      let tableHeader = $(this).parents('.model-gantt-drawer').find('.model-gantt-drawer-wrap thead tr td').eq(curIndex + 2); // 与被点击DON索引相同的抽屉内容行

      let tableLine = $(this).parents('.model-gantt-drawer').find('.model-gantt-drawer-wrap tbody tr'); // console.log($(tableLine[0]).children().eq(curIndex + 2))
      // 如果为选中状态

      if (checkedFlag !== -1) {
        tableHeader.css('display', 'table-cell'); // 显示表格列

        for (let i = 0; i < tableLine.length; i++) {
          // 筛选项索引相同的抽屉列
          let tableRow = $(tableLine[i]).children().eq(curIndex + 2);
          tableRow.css('display', 'table-cell');
        } // 非选中状态

      } else {
        tableHeader.css('display', 'none');

        for (let i = 0; i < tableLine.length; i++) {
          // 筛选项索引相同的抽屉列
          let tableRow = $(tableLine[i]).children().eq(curIndex + 2);
          tableRow.css('display', 'none');
        }
      }
    });
    $('.model-gantt-drawer-setting  .model-gantt-checkbox-wrap input').on('click', function () {
      // 当前被点击的DOM索引
      let curIndex = $(this).parents('.model-gantt-drawer-setting-item').index(); // 选中标识

      let checkedFlag = $(this).parent().attr('class').indexOf('checked'); // 与被点击DON索引相同的抽屉头部列

      let tableHeader = $(this).parents('.model-gantt-drawer').find('.model-gantt-drawer-wrap thead tr td').eq(curIndex + 2); // 与被点击DON索引相同的抽屉内容行

      let tableLine = $(this).parents('.model-gantt-drawer').find('.model-gantt-drawer-wrap tbody tr'); // console.log($(tableLine[0]).children().eq(curIndex + 2))
      // 如果为选中状态

      if (checkedFlag !== -1) {
        tableHeader.css('display', 'table-cell'); // 显示表格列

        for (let i = 0; i < tableLine.length; i++) {
          // 筛选项索引相同的抽屉列
          let tableRow = $(tableLine[i]).children().eq(curIndex + 2);
          tableRow.css('display', 'table-cell');
        } // 非选中状态

      } else {
        tableHeader.css('display', 'none');

        for (let i = 0; i < tableLine.length; i++) {
          // 筛选项索引相同的抽屉列
          let tableRow = $(tableLine[i]).children().eq(curIndex + 2);
          tableRow.css('display', 'none');
        }
      }
    });
  }; // 点击抽屉行，返回id值


  const rowSkip = () => {
    $('.model-gantt-drawer-wrap tbody tr').on('click', function () {
      console.log($(this).attr('fdid'));
      $('.model-gantt-drawer-setting').removeClass('active');
    });
  }; // 多选项目逻辑


  const deleteRow = () => {
    let deleteArr = [];
    let selectAll = $('.select-all').children(); // 全选逻辑

    $('.select-all').on('click', function () {
      // 全选时ID数组先置为空
      deleteArr = []; // 多选项

      let selectBox = $(this).parents('thead').siblings().find('.model-gantt-checkbox-wrap'); // 多选项ID

      let checkedArr = $(this).parents('thead').siblings().children(); // 选中标示

      let checkedFlag = $(this).children().attr('class').indexOf('checked'); // 选中状态

      if (checkedFlag !== -1) {
        selectBox.addClass('checked');

        for (let i = 0; i < checkedArr.length; i++) {
          deleteArr.push($(checkedArr[i]).attr('fdid'));
        } // 取消选中状态

      } else {
        selectBox.removeClass('checked');
        deleteArr = [];
      } // console.log('全选',deleteArr)

    }); // 单选逻辑

    $('.model-gantt-drawer-wrap tbody tr').on('click', '.model-gantt-checkbox-wrap input', function (e) {
      e.stopPropagation(); // 全部单选项的选中状态数组

      let selectAllArr = []; // 全部单选项为选中状态的标识

      let selectAllFlag = false; // 被选中行的ID值

      let checkedId = $(this).parents('tr').attr('fdid'); // 选中标识

      let checkedFlag = $(this).parents('.model-gantt-checkbox').children('.model-gantt-checkbox-wrap').attr('class').indexOf('checked'); // 被点击的单选项的兄弟元素

      let checkSiblings = $(this).parents('tr').siblings().find('.model-gantt-checkbox-wrap'); // 选中状态把对应id推入deleteArr中，当全部按钮被选中时，全选按钮高亮

      if (checkedFlag !== -1) {
        // 遍历其他选项，更改selectAllArr状态
        for (let i = 0; i < checkSiblings.length; i++) {
          let checkedItemFlag = $(checkSiblings[i]).attr('class').indexOf('checked');

          if (checkedItemFlag !== -1) {
            selectAllArr.push(true);
          } else {
            selectAllArr.push(false);
          }
        } // 遍历数组当数组有false时selectAllFlag置为true，没有时selectAllFlag置为false


        selectAllFlag = selectAllArr.some(function (data) {
          return data === false;
        });

        if (!selectAllFlag) {
          selectAll.addClass('checked');
        }

        deleteArr.push(checkedId); // 非选中状态取消全选按钮的高亮
      } else {
        selectAll.removeClass('checked');
        deleteArr = deleteArr.filter(item => {
          return item !== checkedId;
        });
      } // console.log('单选',deleteArr)

    });
  }; // 渲染DOM函数


  const renderInit = () => {
    // 渲染型函数
    renderBody();
    renderTable(timeData.dataArr[3], missionData.missionContent);
    renderProgress(missionData.missionContent, timeData.dataArr[3]);
    renderMsgMask();
    renderFilterPanel(missionData.missionTitle);
    renderDrawer(missionData);
    renderPositionElement(timeData.dataArr[3]); // 功能型函数

    calculateWidth();
    operateDrawer();
    mousePosition();
    alertMsg();
    publicBehavior();
    clickFilter();
    rowSkip();
    deleteRow();
  };

  renderInit(); // 点击视图切换

  $('.model-gantt-tab-change').on('click', function () {
    $(this).toggleClass('active');
  }); // 重新渲染甘特图

  const renderChange = (argTime, argMission) => {
    renderBody();
    renderTable(argTime, argMission.missionContent);
    renderProgress(argMission.missionContent, argTime);
    renderMsgMask();
    renderFilterPanel(argMission.missionTitle);
    renderDrawer(argMission);
    renderPositionElement(argTime); // 功能型函数

    calculateWidth();
    operateDrawer();
    mousePosition();
    alertMsg();
    publicBehavior();
    clickFilter();
    rowSkip();
    deleteRow();
  }; // 删除之前页面上的数据


  const resetInit = () => {
    $('#gantt').empty();
  };

  $('.model-gantt-tab-change-select li').on('click', function (e) {
    e.stopPropagation();
    let selectIndex = $(this).index();
    $(this).siblings().removeClass('active');
    $(this).toggleClass('active');
    resetInit();
    renderChange(timeData.dataArr[selectIndex], missionData);
  });
});