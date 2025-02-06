import { useState } from "react";
import { Step, Stepper, useStepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import invoiceStepsJson from "./invoiceStructure.json";
import type { StepItem } from "@/components/ui/stepper";
import { generatePdf } from "./util";

interface FieldDefinition {
  name: string;
  label: string;
  type: "string" | "number" | "date";
  required: boolean;
  defaultValue?: string;
}

interface StepDefinition {
  stepId: string;
  title: string;
  description: string;
  fields: FieldDefinition[];
}

const handleSubmit = (invoiceData: any) => {
  // This is where you'd:
  //  - Generate a PDF using invoiceData
  //  - Or send invoiceData to your backend via fetch/axios
  console.log("Final Invoice Data:", invoiceData);
  generatePdf(invoiceData);
  alert("Invoice creation complete! Check console for data.");
};

export default function App() {
  const [invoiceData, setInvoiceData] = useState<Record<string, any>>({});
  // Transform JSON into StepItem array
  const jsonSteps = invoiceStepsJson.invoiceCreationFlow.steps;
  const steps: (StepItem & { meta: StepDefinition })[] = jsonSteps.map(
    (stepDefinition, index) => ({
      label: stepDefinition.title || `Step ${index + 1}`,
      meta: stepDefinition as StepDefinition,
    })
  );

  return (
    <div className="flex w-full h-screen flex-col gap-4 p-4">
      <div className="flex-1 flex flex-col gap-4 p-4">
        <Stepper initialStep={0} steps={steps}>
          {/* <Footer /> */}
          {steps.map((stepProps) => {
            // stepProps.meta contains the entire JSON definition for this step
            return (
              <Step key={stepProps.label} {...stepProps}>
                <DynamicStepContent
                  stepDefinition={stepProps.meta}
                  setInvoiceData={setInvoiceData}
                  invoiceData={invoiceData}
                />
              </Step>
            );
          })}
        </Stepper>
      </div>
    </div>
  );
}

function DynamicStepContent({
  stepDefinition,
  invoiceData,
  setInvoiceData,
}: {
  stepDefinition: StepDefinition;
  invoiceData: Record<string, any>;
  setInvoiceData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}) {
  // stepDefinition has shape:
  // {
  //   stepId: "basic-info",
  //   title: "Basic Invoice Info",
  //   description: "...",
  //   fields: [...]
  // }

  return (
    <div className="bg-secondary text-primary flex flex-col flex-1 gap-4 items-center justify-start rounded-md border p-4 overflow-y-auto">
      <div className="flex w-full justify-end">
        <Footer invoiceData={invoiceData} />
      </div>
      <h2 className="text-xl font-bold">{stepDefinition.title}</h2>
      <p className="text-sm">{stepDefinition.description}</p>

      {/* Render fields dynamically */}
      <div className="w-full flex flex-col gap-2">
        {stepDefinition.fields.map((field: FieldDefinition) => (
          <FormField
            key={field.name}
            field={field}
            invoiceData={invoiceData}
            setInvoiceData={setInvoiceData}
          />
        ))}
      </div>
    </div>
  );
}

// Minimal example of a dynamic form field
function FormField({
  field,
  invoiceData,
  setInvoiceData,
}: {
  field: FieldDefinition;
  invoiceData: Record<string, any>;
  setInvoiceData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}) {
  const handleChange = (newValue: string | number) => {
    setInvoiceData((prevData) => ({
      ...prevData,
      [field.name]: newValue,
    }));
    console.log(invoiceData);
  };

  return (
    <div className="flex flex-col">
      <label className="font-medium" htmlFor={field.name}>
        {field.label}
        {field.required ? " *" : ""}
      </label>

      {field.type === "string" && (
        <input
          id={field.name}
          className="border rounded p-1"
          type="text"
          required={field.required}
          value={invoiceData[field.name] ?? field.defaultValue ?? ""}
          onChange={(e) => handleChange(e.target.value)}
        />
      )}
      {field.type === "date" && (
        <input
          id={field.name}
          className="border rounded p-1"
          type="date"
          required={field.required}
          value={invoiceData[field.name] ?? field.defaultValue ?? ""}
          onChange={(e) => handleChange(e.target.value)}
        />
      )}
      {field.type === "number" && (
        <input
          id={field.name}
          className="border rounded p-1"
          type="number"
          required={field.required}
          value={invoiceData[field.name] ?? field.defaultValue ?? ""}
          onChange={(e) => handleChange(e.target.value)}
        />
      )}
      {/* For arrays / nested structures, you'd create more complex logic */}
    </div>
  );
}

function Footer({ invoiceData }: { invoiceData: Record<string, any> }) {
  const {
    nextStep,
    prevStep,
    resetSteps,
    hasCompletedAllSteps,
    isLastStep,
    isOptionalStep,
    isDisabledStep,
  } = useStepper();

  return (
    <>
      {hasCompletedAllSteps && (
        <div className="bg-secondary text-primary my-2 flex h-40 items-center justify-center rounded-md border">
          <h1 className="text-xl">Woohoo! All steps completed! 🎉</h1>
        </div>
      )}
      <div className="flex w-full justify-end gap-2">
        {hasCompletedAllSteps ? (
          <Button size="sm" onClick={resetSteps}>
            Reset
          </Button>
        ) : (
          <>
            <Button
              disabled={isDisabledStep}
              onClick={prevStep}
              size="sm"
              variant="secondary"
            >
              Prev
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (isLastStep) {
                  handleSubmit(invoiceData);
                } else {
                  nextStep();
                }
              }}
            >
              {isLastStep ? "Finish" : isOptionalStep ? "Skip" : "Next"}
            </Button>
          </>
        )}
      </div>
    </>
  );
}
