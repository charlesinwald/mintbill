import { useState } from "react";
import { Step, Stepper, useStepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import invoiceStepsJson from "./invoiceStructure.json";
import type { StepItem } from "@/components/ui/stepper";
import { generatePdf } from "./util";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dotted-dialog";

interface FieldDefinition {
  name: string;
  label: string;
  type: "string" | "number" | "date" | "items" | "array";
  required: boolean;
  defaultValue?: string;
}

interface StepDefinition {
  stepId: string;
  title: string;
  description: string;
  fields: FieldDefinition[];
}

// Define a type for invoiceData
interface InvoiceData {
  items: Array<{
    itemType: string;
    description: string;
    quantity: number;
    unitPrice: number;
    itemLevelDiscount: number;
    itemTaxRates: { rate: number; description: string }[]; // Example of a more specific type
  }>;
  invoiceDiscount: number;
  invoiceTaxes: number;
  [key: string]: any; // For any additional dynamic fields
}

const handleSubmit = (
  invoiceData: InvoiceData,
  setIsSubmitDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // This is where you'd:
  //  - Generate a PDF using invoiceData
  //  - Or send invoiceData to your backend via fetch/axios
  console.log("Final Invoice Data:", invoiceData);
  generatePdf(invoiceData);
  setIsSubmitDialogOpen(true);
};

export default function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    items: [],
    invoiceDiscount: 0,
    invoiceTaxes: 0,
  });
  // Transform JSON into StepItem array
  const jsonSteps = invoiceStepsJson.invoiceCreationFlow.steps;
  const steps: (StepItem & { meta: StepDefinition })[] = jsonSteps.map(
    (stepDefinition, index) => ({
      label: stepDefinition.title || `Step ${index + 1}`,
      meta: stepDefinition as StepDefinition,
    })
  );

  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  return (
    <div className="flex w-full h-screen flex-col gap-4 p-4">
      <div className="flex-1 flex flex-col gap-4 p-4">
        <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>PDF Created</DialogTitle>
              <DialogDescription>
                Your PDF has been successfully created.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
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
                  currentStepId={stepProps.meta.stepId}
                  setIsSubmitDialogOpen={setIsSubmitDialogOpen}
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
  currentStepId,
  setIsSubmitDialogOpen,
}: {
  stepDefinition: StepDefinition;
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  currentStepId: string;
  setIsSubmitDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  console.log("Current Step ID:", currentStepId);

  // stepDefinition has shape:
  // {
  //   stepId: "basic-info",
  //   title: "Basic Invoice Info",
  //   description: "...",
  //   fields: [...]
  // }

  const handleInvoiceDiscountChange = (value: number) => {
    setInvoiceData((prevData) => ({
      ...prevData,
      invoiceDiscount: value,
    }));
  };

  const handleInvoiceTaxesChange = (value: number) => {
    setInvoiceData((prevData) => ({
      ...prevData,
      invoiceTaxes: value,
    }));
  };

  return (
    <div className="bg-secondary text-primary flex flex-col flex-1 gap-4 items-center justify-start rounded-md border p-4 overflow-y-auto">
      <div className="flex w-full justify-end">
        <Footer
          invoiceData={invoiceData}
          setIsSubmitDialogOpen={setIsSubmitDialogOpen}
        />
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

      {/* Conditionally render the section only on the invoice level slide */}
      {currentStepId === "invoice-level-discounts-taxes" && (
        <>
          "Invoice Level Discounts and Taxes"
          <div className="w-full flex flex-col gap-2 mt-4">
            <label className="font-medium text-primary-dark">
              Invoice Discount
            </label>
            <input
              className="border border-primary-light rounded-md p-2"
              type="number"
              step="0.01"
              value={invoiceData.invoiceDiscount}
              onChange={(e) =>
                handleInvoiceDiscountChange(parseFloat(e.target.value))
              }
            />

            <label className="font-medium text-primary-dark">
              Invoice Taxes
            </label>
            <input
              className="border border-primary-light rounded-md p-2"
              type="number"
              step="0.01"
              value={invoiceData.invoiceTaxes}
              onChange={(e) =>
                handleInvoiceTaxesChange(parseFloat(e.target.value))
              }
            />
          </div>
        </>
      )}
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
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}) {
  console.log(field);
  const handleChange = (newValue: string | number) => {
    setInvoiceData((prevData) => ({
      ...prevData,
      [field.name]: newValue,
    }));
  };

  const handleItemChange = (
    index: number,
    key: string,
    value: string | number
  ) => {
    setInvoiceData((prevData) => {
      const items = [...(prevData.items || [])];
      items[index] = { ...items[index], [key]: value };
      return { ...prevData, items };
    });
  };

  const addItem = () => {
    setInvoiceData((prevData) => ({
      ...prevData,
      items: [
        ...(prevData.items || []),
        {
          itemType: "product",
          description: "",
          quantity: 1,
          unitPrice: 0,
          itemLevelDiscount: 0,
          itemTaxRates: [],
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setInvoiceData((prevData) => ({
      ...prevData,
      items: prevData.items.filter((_: any, i: number) => i !== index),
    }));
  };

  if (field.type === "array" && field.name === "items") {
    return (
      <div className="flex flex-col gap-4">
        <label className="font-medium text-primary-dark">
          {field.label}
          {field.required ? " *" : ""}
        </label>

        <div className="border border-primary-light rounded-lg p-4 bg-primary-lightest">
          {(invoiceData.items || []).length === 0 ? (
            <div className="text-center text-primary-dark py-4">
              No items added yet. Click the button below to add your first item.
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 mb-2 font-medium text-sm text-primary-dark">
                <div className="col-span-3">Description</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Unit Price</div>
                <div className="col-span-2">Discount</div>
                <div className="col-span-1"></div>
              </div>

              {/* Items */}
              {(invoiceData.items || []).map((item: any, index: number) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 items-center py-2 border-b border-primary-light last:border-b-0"
                >
                  <div className="col-span-3">
                    <input
                      className="w-full px-3 py-2 border border-primary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark"
                      type="text"
                      placeholder="Item description"
                      value={item.description || ""}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      className="w-full px-3 py-2 border border-primary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark"
                      value={item.itemType || "product"}
                      onChange={(e) =>
                        handleItemChange(index, "itemType", e.target.value)
                      }
                    >
                      <option value="product">Product</option>
                      <option value="service">Service</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      className="w-full px-3 py-2 border border-primary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark"
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity || 1}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      className="w-full px-3 py-2 border border-primary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark"
                      type="number"
                      step="0.01"
                      placeholder="Unit Price"
                      value={item.unitPrice || 0}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "unitPrice",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      className="w-full px-3 py-2 border border-primary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark"
                      type="number"
                      step="0.01"
                      placeholder="Discount"
                      value={item.itemLevelDiscount || 0}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "itemLevelDiscount",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      className="text-primary-dark hover:text-primary-darkest p-2 rounded-full hover:bg-primary-lightest"
                      onClick={() => removeItem(index)}
                      title="Remove item"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          <div className="mt-4">
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-dark border border-primary-dark rounded-md hover:bg-primary-lightest"
              onClick={addItem}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Item
            </button>
          </div>
        </div>

        {/* Optional: Show total */}
        {(invoiceData.items || []).length > 0 && (
          <div className="text-right text-sm text-primary-dark">
            Total: {invoiceData.currency || "$"}
            {(invoiceData.items || [])
              .reduce(
                (
                  sum: number,
                  item: {
                    quantity: number;
                    unitPrice: number;
                    itemLevelDiscount: number;
                  }
                ) =>
                  sum +
                  (item.quantity || 0) * (item.unitPrice || 0) -
                  (item.itemLevelDiscount || 0),
                0
              )
              .toFixed(2)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <label className="font-medium" htmlFor={field.name}>
        {field.label !== "Invoice-Level Discount" &&
          field.label !== "Invoice-Level Taxes" &&
          field.label}
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

function Footer({
  invoiceData,
  setIsSubmitDialogOpen,
}: {
  invoiceData: InvoiceData;
  setIsSubmitDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
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
          <Button
            size="sm"
            onClick={resetSteps}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Reset
          </Button>
        ) : (
          <>
            <Button
              disabled={isDisabledStep}
              onClick={prevStep}
              size="sm"
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10"
            >
              Prev
            </Button>
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => {
                if (isLastStep) {
                  handleSubmit(invoiceData, setIsSubmitDialogOpen);
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
