const sliders = {};

export function StartSlider(sliderId, safeName) {

    const slider = document.getElementById(sliderId);
    if (!slider) return;

    const slides = slider.children;

    if (sliders[sliderId]?.interval) {
        clearInterval(sliders[sliderId].interval);
    }

    sliders[sliderId] = {
        index: 0,
        interval: null,
        update: null
    };

    function update() {

        const state = sliders[sliderId];
        if (!state) return;

        slider.style.transform =
            `translateX(-${state.index * 100}%)`;

        const currentSlide = slides[state.index];
        const title = currentSlide.dataset.title;

        const titleEl = document.getElementById(`photoTitle_${safeName}`);
        if (titleEl) {
            titleEl.textContent = title || "-";
        }

        updateDots(sliderId, state.index);
    }

    sliders[sliderId].update = update;

    function next() {
        const state = sliders[sliderId];
        state.index = (state.index + 1) % slides.length;
        update();
    }

    function prev() {
        const state = sliders[sliderId];
        state.index = (state.index - 1 + slides.length) % slides.length;
        update();
    }

    sliders[sliderId].interval = setInterval(next, 3000);

    window.NextSlide = (id) => {
        if (id !== sliderId) return;
        next();
    };

    window.PrevSlide = (id) => {
        if (id !== sliderId) return;
        prev();
    };

    window.SlideTo = (id, index) => {
        if (id !== sliderId) return;

        const state = sliders[id];
        if (!state) return;

        state.index = index;
        state.update();
        
        clearInterval(state.interval);
        state.interval = setInterval(next, 3000);
    };

    const wrapper = slider.parentElement;

    wrapper.addEventListener("mouseenter", () => {
        clearInterval(sliders[sliderId].interval);
    });

    wrapper.addEventListener("mouseleave", () => {
        sliders[sliderId].interval = setInterval(next, 3000);
    });

    let startX = 0;
    let isDragging = false;

    slider.addEventListener("mousedown", e => {
        isDragging = true;
        startX = e.clientX;
        clearInterval(sliders[sliderId].interval);
    });

    document.addEventListener("mouseup", e => {
        if (!isDragging) return;

        const diff = e.clientX - startX;

        if (diff > 50) prev();
        else if (diff < -50) next();

        isDragging = false;
        sliders[sliderId].interval = setInterval(next, 3000);
    });

    slider.addEventListener("touchstart", e => {
        startX = e.touches[0].clientX;
        clearInterval(sliders[sliderId].interval);
    });

    slider.addEventListener("touchend", e => {
        const endX = e.changedTouches[0].clientX;
        const diff = endX - startX;

        if (diff > 50) prev();
        else if (diff < -50) next();

        sliders[sliderId].interval = setInterval(next, 3000);
    });

    update();
}

export function NextSlide(sliderId) {
    const state = sliders[sliderId];
    if (!state) return;

    const slider = document.getElementById(sliderId);
    const total = slider.children.length;

    state.index = (state.index + 1) % total;
    state.update();
}

export function PrevSlide(sliderId) {
    const state = sliders[sliderId];
    if (!state) return;

    const slider = document.getElementById(sliderId);
    const total = slider.children.length;

    state.index = (state.index - 1 + total) % total;
    state.update();
}

export function SlideTo(sliderId, index) {
    const state = sliders[sliderId];
    if (!state) return;

    state.index = index;
    state.update();
}

function updateDots(sliderId, activeIndex) {

    const dotsContainer = document.getElementById(
        sliderId.replace("slider", "dots")
    );

    if (!dotsContainer) return;

    const dots = dotsContainer.children;

    Array.from(dots).forEach((dot, i) => {
        dot.classList.toggle("active", i === activeIndex);
    });
}