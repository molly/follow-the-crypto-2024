/**
 * Sidebar toggle functionality for static HTML pages
 * Based on the React Sidebar component from follow-the-crypto
 */

(function () {
  "use strict";

  // State
  let isCollapsed = true;

  // DOM elements
  const sidebar = document.getElementById("sidebar");
  const collapseButton = document.querySelector(".sidebar_onCardCollapseButton");
  const floatingButton = document.querySelector(".sidebar_floatingCollapseButton");
  const sidebarLinks = document.querySelectorAll(".sidebar_sidebarLink");
  const sidebarItems = document.querySelectorAll(".sidebar_sidebarListItem .sidebar_sidebarHeader");

  // Animation duration in ms (matching React component)
  const ANIMATION_DURATION = 200;

  /**
   * Updates the sidebar transform and visibility
   */
  function updateSidebarTransform() {
    if (!sidebar) return;

    if (isCollapsed) {
      // Hide sidebar
      sidebar.style.transform = "translateX(-100%) translateZ(0)";
      sidebar.style.transition = "transform 0.2s ease-in-out";
    } else {
      // Show sidebar
      sidebar.style.transform = "translateX(0) translateZ(0)";
      sidebar.style.transition = "transform 0.2s ease-in-out";
    }
  }

  /**
   * Updates button visibility and aria attributes
   */
  function updateButtons() {
    if (collapseButton) {
      collapseButton.setAttribute("aria-expanded", !isCollapsed);
    }

    if (floatingButton) {
      floatingButton.setAttribute("aria-expanded", !isCollapsed);
      if (isCollapsed) {
        floatingButton.style.display = "flex";
      } else {
        floatingButton.style.display = "none";
      }
    }
  }

  /**
   * Animates sidebar items opacity (mimicking framer-motion stagger)
   */
  function animateItems() {
    if (!sidebarItems.length) return;

    if (isCollapsed) {
      // Fade out items
      sidebarItems.forEach((item, index) => {
        setTimeout(() => {
          item.style.opacity = "0";
          item.style.transition = "opacity 0.1s ease-in-out";
        }, index * 25);
      });
    } else {
      // Fade in items with stagger
      sidebarItems.forEach((item, index) => {
        setTimeout(() => {
          item.style.opacity = "1";
          item.style.transition = "opacity 0.1s ease-in-out";
        }, index * 25);
      });
    }
  }

  /**
   * Toggles the sidebar open/closed
   */
  function toggleSidebar() {
    isCollapsed = !isCollapsed;
    updateSidebarTransform();
    updateButtons();
    animateItems();

    // Focus management - focus first link when opened
    if (!isCollapsed && sidebarLinks.length > 0) {
      setTimeout(() => {
        sidebarLinks[0].focus();
      }, ANIMATION_DURATION);
    }
  }

  /**
   * Closes the sidebar
   */
  function closeSidebar() {
    if (!isCollapsed) {
      isCollapsed = true;
      updateSidebarTransform();
      updateButtons();
      animateItems();
    }
  }

  /**
   * Opens the sidebar
   */
  function openSidebar() {
    if (isCollapsed) {
      isCollapsed = false;
      updateSidebarTransform();
      updateButtons();
      animateItems();

      // Focus first link when opened
      if (sidebarLinks.length > 0) {
        setTimeout(() => {
          sidebarLinks[0].focus();
        }, ANIMATION_DURATION);
      }
    }
  }

  /**
   * Handles keyboard navigation
   */
  function handleKeydown(event) {
    if (event.key === "Escape" && !isCollapsed) {
      closeSidebar();
    }
  }

  /**
   * Initialize the sidebar functionality
   */
  function init() {
    // Set initial state
    updateSidebarTransform();
    updateButtons();

    // Add event listeners
    if (collapseButton) {
      collapseButton.addEventListener("click", closeSidebar);
    }

    if (floatingButton) {
      floatingButton.addEventListener("click", openSidebar);
    }

    // Close sidebar when clicking on links (like in React component)
    sidebarLinks.forEach((link) => {
      link.addEventListener("click", closeSidebar);
    });

    // Add keyboard support
    document.addEventListener("keydown", handleKeydown);

    // Close sidebar when clicking outside (optional enhancement)
    document.addEventListener("click", (event) => {
      if (!isCollapsed && sidebar && !sidebar.contains(event.target) && !floatingButton?.contains(event.target)) {
        closeSidebar();
      }
    });

    console.log("Sidebar toggle functionality initialized");
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Export functions for potential external use
  window.sidebarToggle = {
    open: openSidebar,
    close: closeSidebar,
    toggle: toggleSidebar,
    isCollapsed: () => isCollapsed,
  };
})();
