/*
	Solid State by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function ($) {

	var $window = $(window),
		$body = $('body'),
		$header = $('#header'),
		$banner = $('#banner');

	// Breakpoints.
	breakpoints({
		xlarge: '(max-width: 1680px)',
		large: '(max-width: 1280px)',
		medium: '(max-width: 980px)',
		small: '(max-width: 736px)',
		xsmall: '(max-width: 480px)'
	});

	// Play initial animations on page load.
	$window.on('load', function () {
		window.setTimeout(function () {
			$body.removeClass('is-preload');
		}, 100);
	});

	// Header.
	if ($banner.length > 0
		&& $header.hasClass('alt')) {

		$window.on('resize', function () { $window.trigger('scroll'); });

		$banner.scrollex({
			bottom: $header.outerHeight(),
			terminate: function () { $header.removeClass('alt'); },
			enter: function () { $header.addClass('alt'); },
			leave: function () { $header.removeClass('alt'); }
		});

	}

	// Menu.
	var $menu = $('#menu');

	$menu._locked = false;

	$menu._lock = function () {

		if ($menu._locked)
			return false;

		$menu._locked = true;

		window.setTimeout(function () {
			$menu._locked = false;
		}, 350);

		return true;

	};

	$menu._show = function () {

		if ($menu._lock())
			$body.addClass('is-menu-visible');

	};

	$menu._hide = function () {

		if ($menu._lock())
			$body.removeClass('is-menu-visible');

	};

	$menu._toggle = function () {

		if ($menu._lock())
			$body.toggleClass('is-menu-visible');

	};

	$menu
		.appendTo($body)
		.on('click', function (event) {

			event.stopPropagation();

			// Hide.
			$menu._hide();

		})
		.find('.inner')
		.on('click', '.close', function (event) {

			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();

			// Hide.
			$menu._hide();

		})
		.on('click', function (event) {
			event.stopPropagation();
		})
		.on('click', 'a', function (event) {

			var href = $(this).attr('href');

			event.preventDefault();
			event.stopPropagation();

			// Hide.
			$menu._hide();

			// Redirect.
			window.setTimeout(function () {
				window.location.href = href;
			}, 350);

		});

	$body
		.on('click', 'a[href="#menu"]', function (event) {

			event.stopPropagation();
			event.preventDefault();

			// Toggle.
			$menu._toggle();

		})
		.on('keydown', function (event) {

			// Hide on escape.
			if (event.keyCode == 27)
				$menu._hide();

		});

})(jQuery);

document.addEventListener('DOMContentLoaded', function () {
  // 选择所有 h3.major 元素（文档顺序）
  const headers = Array.from(document.querySelectorAll('h3.major'))
    // 只保留文本像日期的项（简单过滤含数字）
    .filter(h => /\d{4}.*\d{1,2}/.test(h.textContent.trim()));
  if (headers.length === 0) return;

  // 组织为按文本(日期)分组的 Map（按第一次出现顺序）
  const groups = new Map();
  headers.forEach(h => {
    const key = h.textContent.trim();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(h);
  });

  // 构建侧边栏 DOM 引用
  const sidebar = document.getElementById('timelineSidebar');
  const list = document.getElementById('timelineList');
  // 如果没有 sidebar（未插入），则退出
  if (!sidebar || !list) return;

  // 以 groups 的插入顺序生成列表项
  let idx = 0;
  groups.forEach((nodes, date) => {
    idx++;
    const li = document.createElement('li');
    li.className = 'timeline-item';
    li.setAttribute('data-date', date);
    li.setAttribute('data-index', String(idx));
    // aria 支持：表示将跳转到日期
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');

    // 点
    const dot = document.createElement('span');
    dot.className = 'dot';
    li.appendChild(dot);

    // 文本
    const txt = document.createElement('span');
    txt.className = 'date-text';
    txt.textContent = date;
    li.appendChild(txt);

    // 点击/回车/空格 平滑滚动到该日期第一个元素
    li.addEventListener('click', () => {
      nodes[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      // 触发一次高亮（短暂）
      setActiveByDate(date);
    });

    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        li.click();
      }
    });

    list.appendChild(li);
  });

  // 显示 sidebar
  sidebar.hidden = false;

  // IntersectionObserver：当某个 h3 进入可视（更多阈值）时高亮侧边时间轴
  const options = {
    root: null,
    rootMargin: '0px 0px -30% 0px', // 当标题接近视口顶部时触发
    threshold: [0, 0.2, 0.5, 0.8, 1]
  };

  const observer = new IntersectionObserver((entries) => {
    // 找到最接近视口中心的条目作为当前 active
    const visible = entries.filter(e => e.isIntersecting);
    if (visible.length === 0) {
      // 如果没有可见则移除所有高亮
      clearAllActive();
      return;
    }

    // 计算哪个 header 最居中（最小与窗口中心的差距）
    let best = null;
    let bestScore = Infinity;
    visible.forEach(e => {
      const rect = e.boundingClientRect;
      const centerY = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const score = Math.abs(centerY - viewportCenter);
      if (score < bestScore) {
        bestScore = score;
        best = e;
      }
    });

    if (best && best.target) {
      const date = best.target.textContent.trim();
      setActiveByDate(date);
    }
  }, options);

  // 观察所有 headers（groups keys 中包含的）
  headers.forEach(h => observer.observe(h));

  // 设置高亮函数：按 date 激活
  function setActiveByDate(date) {
    const items = list.querySelectorAll('.timeline-item');
    items.forEach(it => {
      if (it.getAttribute('data-date') === date) {
        it.classList.add('active');
        // 如果 item 在侧边栏不可见则滚动侧边栏使其可见
        it.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        it.classList.remove('active');
      }
    });
  }

  function clearAllActive() {
    const items = list.querySelectorAll('.timeline-item.active');
    items.forEach(it => it.classList.remove('active'));
  }

  // 页面初次载入时选中靠顶部第一个可见日期（如果有）
  function initActive() {
    for (const [date, nodes] of groups.entries()) {
      const el = nodes[0];
      const rect = el.getBoundingClientRect();
      if (rect.top >= 0 && rect.top < window.innerHeight) {
        setActiveByDate(date);
        return;
      }
    }
    // 如果没有一个可见则选第一个条目（可选）
    // setActiveByDate(Array.from(groups.keys())[0]);
  }

  // 轻量防抖：窗口尺寸变化时重新观察
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      observer.disconnect();
      headers.forEach(h => observer.observe(h));
    }, 200);
  });

  // 初始检查
  initActive();
});