const STEPS = ['placed', 'confirmed', 'shipped', 'delivered'];

function OrderTracker({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="tracker tracker--cancelled">
        <p>This order was cancelled</p>
      </div>
    );
  }

  const activeIndex = STEPS.indexOf(status);

  return (
    <ol className="tracker">
      {STEPS.map((step, index) => {
        const done = index <= activeIndex;
        const current = index === activeIndex;
        return (
          <li
            key={step}
            className={`tracker__step ${done ? 'is-done' : ''} ${current ? 'is-current' : ''}`}
          >
            <span className="tracker__dot" />
            <span className="tracker__label">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default OrderTracker;
