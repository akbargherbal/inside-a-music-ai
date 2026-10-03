import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WidgetStage } from '../../src/components/WidgetStage';
import { W1TokenizationWidget } from '../../src/widgets/w1-tokenization';
import { W2EmbeddingsWidget } from '../../src/widgets/w2-embeddings';
import { W3AttentionWidget } from '../../src/widgets/w3-attention';
import { W4MultiHeadWidget } from '../../src/widgets/w4-multihead';
import { W5BlockWidget } from '../../src/widgets/w5-block';
import { W6SamplingWidget } from '../../src/widgets/w6-sampling';
import { W7LoopWidget } from '../../src/widgets/w7-loop';

function renderStage(ui: React.ReactNode, props: Partial<Parameters<typeof WidgetStage>[0]> = {}) {
  const onStepChange = vi.fn();
  render(
    <WidgetStage
      id="demo"
      title="Demo"
      step={props.step ?? 0}
      totalSteps={props.totalSteps ?? 3}
      onStepChange={props.onStepChange ?? onStepChange}
      dataKind={props.dataKind ?? 'illustrative'}
      liveCaption={props.liveCaption ?? 'step caption'}
      reducedMotion={props.reducedMotion ?? false}
      stepLabels={['one', 'two', 'three']}
    >
      {ui}
    </WidgetStage>
  );
  return { onStepChange };
}

describe('WidgetStage contract', () => {
  it('renders the widget test id, a data badge and a live caption', () => {
    renderStage(<div>child</div>);
    expect(screen.getByTestId('widget-demo')).toBeInTheDocument();
    expect(screen.getByText(/illustrative/i)).toBeInTheDocument();
    expect(screen.getByText('step caption')).toBeInTheDocument();
  });

  it('Next and Prev call onStepChange with the neighbouring step', () => {
    const { onStepChange } = renderStage(<div>child</div>, { step: 1, totalSteps: 3 });
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    expect(onStepChange).toHaveBeenCalledWith(2);
    fireEvent.click(screen.getByRole('button', { name: /previous step/i }));
    expect(onStepChange).toHaveBeenCalledWith(0);
  });

  it('arrow keys change the step when the stage has focus', () => {
    const onStepChange = vi.fn();
    renderStage(<div>child</div>, { step: 1, totalSteps: 3, onStepChange });
    const stage = screen.getByTestId('widget-demo');
    stage.focus();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(onStepChange).toHaveBeenCalledWith(2);
  });

  it('an error in one widget shows the fallback instead of crashing the page', () => {
    const Boom = () => {
      throw new Error('boom');
    };
    renderStage(<Boom />);
    expect(screen.getByText(/widget simulation paused/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset to step 1/i })).toBeInTheDocument();
  });

  it('exposes data-step so scroll and controls can be asserted', () => {
    renderStage(<div>child</div>, { step: 2, totalSteps: 5 });
    expect(screen.getByTestId('widget-demo')).toHaveAttribute('data-step', '2');
  });
});

describe('widgets render at every step', () => {
  const cases: Array<[string, React.FC<{ step: number; stepCount: number; reducedMotion: boolean }>, number]> = [
    ['W1', W1TokenizationWidget, 5],
    ['W2', W2EmbeddingsWidget, 5],
    ['W3', W3AttentionWidget, 7],
    ['W4', W4MultiHeadWidget, 5],
    ['W5', W5BlockWidget, 7],
    ['W6', W6SamplingWidget, 6],
    ['W7', W7LoopWidget, 6],
  ];

  it.each(cases)('%s renders at every step without throwing', (_name, Widget, lastStep) => {
    for (let step = 0; step <= lastStep; step++) {
      const { unmount } = render(
        <Widget step={step} stepCount={lastStep + 1} reducedMotion={true} />
      );
      expect(document.body.textContent?.length ?? 0).toBeGreaterThan(0);
      unmount();
    }
  });

  it('W3 shows guitar as the winning token for query "it" (step 4)', () => {
    render(<W3AttentionWidget step={4} stepCount={8} reducedMotion={true} />);
    expect(screen.getAllByText(/guitar/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/winner/i)).toBeInTheDocument();
  });

  it('W6 seed 7 rolls "floor" deterministically', () => {
    render(<W6SamplingWidget step={5} stepCount={7} reducedMotion={true} />);
    expect(screen.getAllByText(/floor/i).length).toBeGreaterThan(0);
  });
});
