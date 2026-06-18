import React from 'react';
import { BENEFITS } from '../../constants/app';

const Benefits: React.FC = () => {
  return (
    <section className="benefits" id="beneficios">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <h2>Por que escolher a Neurovita?</h2>
          <p>Profissionais experientes, tecnologia avançada e atendimento humanizado</p>
        </div>

        {/* Benefits Grid */}
        <div className="benefits-grid">
          {BENEFITS.map((benefit, idx) => (
            <div key={idx} className="benefit-card">
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
