useGSAP(() => {
  if (bookButtonRef.current) {
    gsap.to(bookButtonRef.current, {
      duration: 0.5,
      opacity: isMouseActive ? 0.8 : 0,
      ease: "power2.inOut"
    })
  }
  if (divRef.current) {
    gsap.to(divRef.current, {
      duration: 0.5,
      opacity: isMouseActive ? 0.8 : 0,
      ease: "power2.inOut",
      onStart: () => setShowDivs(true)
    });
  }
}, [isMouseActive]); 