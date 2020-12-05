import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Font, pdf } from '@react-pdf/renderer';
import format from 'date-fns/format';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import CalendarInput from '../common/CalendarInput';
import Document from '../common/Document';
import Page from '../common/Page';
import View from '../common/View';
import Text from '../common/Text';
import Download from '../common/DownloadPDF';
import { invoiceLabels, initialInvoiceData, initialItem } from '../../data/initialData';

Font.register({
  family: 'Nunito',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/nunito/v12/XRXV3I6Li01BKofINeaE.ttf' },
    { src: 'https://fonts.gstatic.com/s/nunito/v12/XRXW3I6Li01BKofA6sKUYevN.ttf', fontWeight: 600 }
  ]
});

const Invoice = props => {
  const { data, pdfMode, match } = props;
  const {
    title,
    gstinLabel,
    buyerGstnLabel,
    billTo,
    shipTo,
    buyerNameLabel,
    invoiceDateLabel,
    posLabel,
    transportLabel,
    vehicleNoLabel,
    grNoLabel,
    productLineDescription,
    productLineQuantity,
    productLineHsn,
    productLineQuantityRate,
    productLineQuantityIGST,
    productLineQuantityCGST,
    productLineQuantitySGST,
    productLineQuantityAmount,
    paidLabel,
    totalLabel,
    amountDue,
    currency,
    notesLabel,
    termLabel
  } = invoiceLabels;

  const [initialItemData, setInitialItemData] = useState(initialItem);
  const [firmDetails, setFirmDetails] = useState({});
  const [invoice, setInvoice] = useState(data ? { ...data } : { ...initialInvoiceData });
  const [states, setStates] = useState([{ stateCode: '-1', name: 'Please select state...' }]);
  const [total, setTotal] = useState();

  const dateFormat = 'MMM dd, yyyy';
  const invoiceDate = invoice.invoiceDate !== '' ? new Date(invoice.invoiceDate) : new Date();

  useEffect(() => {
    if (match && match.params && match.params.id) {
      const URL1 = 'http://localhost:3000/firm';
      const URL2 = 'http://localhost:3000/states';
      const URL3 = 'http://localhost:3000/invoiceDetails123';

      const promise1 = axios.get(URL1);
      const promise2 = axios.get(URL2);
      const promise3 = axios.get(URL3);

      Promise.all([promise1, promise2, promise3]).then(function (values) {
        setFirmDetails({ ...values[0].data });
        setStates([...states, ...values[1].data]);
        setInvoice({ ...invoice, ...values[2].data });
      });
    } else {
      const URL1 = 'http://localhost:3000/firm';
      const URL2 = 'http://localhost:3000/states';

      const promise1 = axios.get(URL1);
      const promise2 = axios.get(URL2);

      Promise.all([promise1, promise2]).then(function (values) {
        setFirmDetails({ ...values[0].data });
        setStates([...states, ...values[1].data]);
        setInvoice({ ...invoice, ...initialItemData });
      });
    }
  }, []);

  const handleChange = (name, value) => {
    if (name !== 'items') {
      const newInvoice = { ...invoice };
      newInvoice[name] = value;

      setInvoice(newInvoice);
    }
  };

  const handleProductLineChange = (index, name, value) => {
    const items = invoice.items.map((productLine, i) => {
      if (i === index) {
        const newProductLine = { ...productLine };

        if (name === 'itemName') {
          newProductLine[name] = value;
        } else {
          if (value[value.length - 1] === '.' || (value[value.length - 1] === '0' && value.includes('.'))) {
            newProductLine[name] = value;
          } else {
            const n = parseFloat(value);
            newProductLine[name] = (n ? n : 0).toString();
          }
        }
        newProductLine.totalAmount = calculateAmount(
          newProductLine.quantity,
          newProductLine.igst,
          newProductLine.cgst,
          newProductLine.sgst,
          newProductLine.itemRate
        );
        return newProductLine;
      }
      return { ...productLine };
    });
    setInvoice({ ...invoice, items });
  };

  const handleRemove = i => {
    const items = invoice.items.filter((productLine, index) => index !== i);
    setInvoice({ ...invoice, items });
  };

  const handleAdd = () => {
    const items = [...invoice.items, { ...initialItemData }];
    setInvoice({ ...invoice, items });
  };

  const calculateAmount = (quantity, igst, cgst, sgst, itemRate) => {
    const quantityNumber = parseFloat(quantity);
    const rateNumber = parseFloat(itemRate);
    const igstNumber = igst ? parseFloat(igst) : 0;
    const cgstNumber = cgst ? parseFloat(cgst) : 0;
    const sgstNumber = sgst ? parseFloat(sgst) : 0;
    let amount = quantityNumber && rateNumber ? quantityNumber * rateNumber : 0;
    amount = igstNumber ? (amount * igstNumber) / 100 + amount : amount;
    amount = cgstNumber ? (amount * cgstNumber) / 100 + amount : amount;
    amount = sgstNumber ? (amount * sgstNumber) / 100 + amount : amount;

    return amount.toFixed(2);
  };

  useEffect(() => {
    let total = 0;

    invoice.items.forEach(productLine => {
      const quantityNumber = parseFloat(productLine.quantity);
      const rateNumber = parseFloat(productLine.itemRate);
      const igstNumber = productLine.igst ? parseFloat(productLine.igst) : 0;
      const cgstNumber = productLine.cgst ? parseFloat(productLine.cgst) : 0;
      const sgstNumber = productLine.sgst ? parseFloat(productLine.sgst) : 0;
      let amount = quantityNumber && rateNumber ? quantityNumber * rateNumber : 0;
      amount = igstNumber ? (amount * igstNumber) / 100 + amount : amount;
      amount = cgstNumber ? (amount * cgstNumber) / 100 + amount : amount;
      amount = sgstNumber ? (amount * sgstNumber) / 100 + amount : amount;

      total += amount;
    });

    setTotal(total);
  }, [invoice.items]);

  useEffect(() => {
    if (invoice.placeOfSupply !== '-1' && invoice.placeOfSupply !== invoice.stateCode) {
      setInitialItemData({ ...initialItemData, igst: '5' });
      let lineItems = invoice.items;
      lineItems = lineItems.map(lineItem => {
        lineItem.igst = '5';
        return lineItem;
      });
      const items = [...lineItems];
      setInvoice({ ...invoice, items });
    }
  }, [invoice.placeOfSupply]);

  const saveInvoiceDetails = () => {
    invoice.totalAmount = total;
    invoice.transactions = [
      {
        amountPaid: invoice.paidAmount,
        paymentMode: 'Cash'
      }
    ];
    const invoiceDetails = { ...invoice };
    const keysNotreq = [
      'tradeName',
      'legalName',
      'businessDesc',
      'businessAddress',
      'contactNo',
      'email',
      'termAndConditions',
      'notes',
      'paidAmount'
    ];
    keysNotreq.forEach(key => {
      delete invoiceDetails[key];
    });
    axios
      .post('/saveinvoiceDetails', invoiceDetails)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
        setInvoice({ ...initialInvoiceData, ...firmDetails });
      });
  };

  return (
    <>
      <Document pdfMode={pdfMode} class="w-800">
        <Page className="invoice-wrapper" pdfMode={pdfMode}>
          {!pdfMode && <Download data={invoice} />}

          {/** Header */}
          <View className="flex header" pdfMode={pdfMode}>
            <View className="w-50" pdfMode={pdfMode}>
              <Text className="fs-25 bold" pdfMode={pdfMode}>
                {firmDetails.tradeName}
              </Text>
              <View className="flex mb-5" pdfMode={pdfMode}>
                <View className="w-10" pdfMode={pdfMode}>
                  <Text pdfMode={pdfMode}>{gstinLabel}</Text>
                </View>
                <View className="w-60" pdfMode={pdfMode}>
                  <Text pdfMode={pdfMode}>{invoice.gstn}</Text>
                </View>
              </View>
            </View>
            <View className="w-50 right" pdfMode={pdfMode}>
              <Text className="right no-r-padding" pdfMode={pdfMode}>
                {firmDetails.businessAddress}
              </Text>
              <Text className="right no-r-padding" pdfMode={pdfMode}>
                {invoice.email || firmDetails.email}
              </Text>
              <Text className="right no-r-padding" pdfMode={pdfMode}>
                {invoice.contactNo || firmDetails.contactNo}
              </Text>
            </View>
          </View>

          {/** Invoice Number and title */}
          <View className="flex mt-85" pdfMode={pdfMode}>
            <View className="w-100" pdfMode={pdfMode}>
              <Text className="fs-30 center bold" pdfMode={pdfMode}>
                {title}
              </Text>
              <Text className="center bold" pdfMode={pdfMode}>
                {`#INV-${invoice.invoiceNumber || firmDetails.invoiceNumber}`}
              </Text>
            </View>
          </View>

          {!pdfMode && <View className="flex divider" pdfMode={pdfMode} />}

          {/** Invoice details */}
          <View className="flex gutter-margin" pdfMode={pdfMode}>
            <View className="w-60" pdfMode={pdfMode}>
              <View className="flex mb-5" pdfMode={pdfMode}>
                <View className="w-40" pdfMode={pdfMode}>
                  <Text className="bold" pdfMode={pdfMode}>
                    {invoiceDateLabel}
                  </Text>
                </View>
                <View className="w-40" pdfMode={pdfMode}>
                  <CalendarInput
                    value={format(invoiceDate, dateFormat)}
                    selected={invoiceDate}
                    onChange={date =>
                      handleChange('invoiceDate', date && !Array.isArray(date) ? format(date, dateFormat) : '')
                    }
                    pdfMode={pdfMode}
                  />
                </View>
              </View>
              <View className="flex mb-5" pdfMode={pdfMode}>
                <View className="w-40" pdfMode={pdfMode}>
                  <Text className="bold" pdfMode={pdfMode}>
                    {posLabel}
                  </Text>
                </View>
                <View className="w-40" pdfMode={pdfMode}>
                  <Select
                    options={states}
                    value={invoice.placeOfSupply}
                    onChange={value => handleChange('placeOfSupply', value)}
                    pdfMode={pdfMode}
                  />
                </View>
              </View>
            </View>
            <View className="w-40" pdfMode={pdfMode}>
              <View className="flex mb-5" pdfMode={pdfMode}>
                <View className="w-40" pdfMode={pdfMode}>
                  <Text className="bold" pdfMode={pdfMode}>
                    {grNoLabel}
                  </Text>
                </View>
                <View className="w-60" pdfMode={pdfMode}>
                  <Input
                    className="right"
                    placeholder="GR/RR No."
                    value={invoice.grNo}
                    onChange={value => handleChange('grNo', value)}
                    pdfMode={pdfMode}
                  />
                </View>
              </View>
              <View className="flex mb-5" pdfMode={pdfMode}>
                <View className="w-40" pdfMode={pdfMode}>
                  <Text className="bold" pdfMode={pdfMode}>
                    {transportLabel}
                  </Text>
                </View>
                <View className="w-60" pdfMode={pdfMode}>
                  <Input
                    className="right"
                    placeholder="OWN"
                    value={invoice.transport}
                    onChange={value => handleChange('transport', value)}
                    pdfMode={pdfMode}
                  />
                </View>
              </View>
              <View className="flex mb-5" pdfMode={pdfMode}>
                <View className="w-40" pdfMode={pdfMode}>
                  <Text className="bold" pdfMode={pdfMode}>
                    {vehicleNoLabel}
                  </Text>
                </View>
                <View className="w-60" pdfMode={pdfMode}>
                  <Input
                    className="right"
                    placeholder="HR 51 AC 8975"
                    value={invoice.vehicleNo}
                    onChange={value => handleChange('vehicleNo', value)}
                    pdfMode={pdfMode}
                  />
                </View>
              </View>
            </View>
          </View>

          {!pdfMode && <View className="flex divider" pdfMode={pdfMode} />}

          {/** Bill To | Ship To */}
          <View className="flex gutter-margin" pdfMode={pdfMode}>
            <View className="w-60" pdfMode={pdfMode}>
              <View className="flex mb-5" pdfMode={pdfMode}>
                <View className="w-40" pdfMode={pdfMode}>
                  <Text className="bold dark mb-5" pdfMode={pdfMode}>
                    {buyerGstnLabel}
                  </Text>
                </View>
                <View className="w-40" pdfMode={pdfMode}>
                  <Input
                    placeholder="GSTIN / UIN"
                    value={invoice.buyerGstn}
                    onChange={value => handleChange('buyerGstn', value)}
                    pdfMode={pdfMode}
                  />
                </View>
              </View>
              <View className="flex mb-5" pdfMode={pdfMode}>
                <View className="w-40" pdfMode={pdfMode}>
                  <Text className="bold dark mb-5" pdfMode={pdfMode}>
                    {buyerNameLabel}
                  </Text>
                </View>
                <View className="w-40" pdfMode={pdfMode}>
                  <Input
                    placeholder="Buyer Name"
                    value={invoice.buyerName}
                    onChange={value => handleChange('buyerName', value)}
                    pdfMode={pdfMode}
                  />
                </View>
              </View>
            </View>
            <View className="w-40" pdfMode={pdfMode}>
              <View className="flex mb-5" pdfMode={pdfMode}>
                <View className="w-40" pdfMode={pdfMode}>
                  <Text className="bold dark mb-5" pdfMode={pdfMode}>
                    {billTo}
                  </Text>
                </View>
                <View className="w-60" pdfMode={pdfMode}>
                  <Textarea
                    className="right"
                    placeholder="Billing Address"
                    rows={3}
                    value={invoice.buyerAddress}
                    onChange={value => handleChange('buyerAddress', value)}
                    pdfMode={pdfMode}
                  />
                </View>
              </View>
              <View className="flex mb-5" pdfMode={pdfMode}>
                <View className="w-40" pdfMode={pdfMode}>
                  <Text className="bold dark mb-5" pdfMode={pdfMode}>
                    {shipTo}
                  </Text>
                </View>
                <View className="w-60" pdfMode={pdfMode}>
                  <Textarea
                    className="right"
                    placeholder="Shipping Address"
                    rows={3}
                    value={invoice.buyerDeliveryAddress}
                    onChange={value => handleChange('buyerDeliveryAddress', value)}
                    pdfMode={pdfMode}
                  />
                </View>
              </View>
            </View>
          </View>

          {/** Table Header */}
          <View className="mt-30 bg-secondary b-b-primary flex gutter-margin" pdfMode={pdfMode}>
            <View className="w-5 p-8-8" pdfMode={pdfMode}>
              <Text pdfMode={pdfMode}></Text>
            </View>
            <View className="w-34 p-8-8" pdfMode={pdfMode}>
              <Text className="text-color bold" pdfMode={pdfMode}>
                {productLineDescription}
              </Text>
            </View>
            <View className="w-13 p-8-8" pdfMode={pdfMode}>
              <Text className="text-color bold right" pdfMode={pdfMode}>
                {productLineHsn}
              </Text>
            </View>
            <View className="w-13 p-8-8" pdfMode={pdfMode}>
              <Text className="text-color bold right" pdfMode={pdfMode}>
                {productLineQuantity}
              </Text>
            </View>
            <View className="w-13 p-8-8" pdfMode={pdfMode}>
              <Text className="text-color bold right" pdfMode={pdfMode}>
                {productLineQuantityRate}
              </Text>
            </View>
            <View className="w-8 p-8-8" pdfMode={pdfMode}>
              <Text className="text-color bold right" pdfMode={pdfMode}>
                {productLineQuantityIGST}
              </Text>
            </View>
            <View className="w-8 p-8-8" pdfMode={pdfMode}>
              <Text className="text-color bold right" pdfMode={pdfMode}>
                {productLineQuantityCGST}
              </Text>
            </View>
            <View className="w-8 p-8-8" pdfMode={pdfMode}>
              <Text className="text-color bold right" pdfMode={pdfMode}>
                {productLineQuantitySGST}
              </Text>
            </View>
            <View className="w-13 p-8-8" pdfMode={pdfMode}>
              <Text className="text-color bold right" pdfMode={pdfMode}>
                {productLineQuantityAmount}
              </Text>
            </View>
          </View>

          {/** Table Body */}
          {invoice.items.map((productLine, i) => {
            let srNo = i;
            return pdfMode && productLine.itemName === '' ? (
              <Text key={i} pdfMode={pdfMode}></Text>
            ) : (
              <View key={i} className="row flex gutter-margin" pdfMode={pdfMode}>
                <View className="w-5 p-8-8" pdfMode={pdfMode}>
                  <Text pdfMode={pdfMode}>{++srNo}</Text>
                </View>
                <View className="w-34 p-8-8" pdfMode={pdfMode}>
                  <Input
                    className="dark"
                    placeholder="Enter item name"
                    value={productLine.itemName}
                    onChange={value => handleProductLineChange(i, 'itemName', value)}
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-13 p-8-8" pdfMode={pdfMode}>
                  <Input
                    className="dark right"
                    placeholder="Code"
                    value={productLine.hsn}
                    onChange={value => handleProductLineChange(i, 'hsn', value)}
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-13 p-8-8" pdfMode={pdfMode}>
                  <Input
                    className="dark right"
                    value={productLine.quantity}
                    onChange={value => handleProductLineChange(i, 'quantity', value)}
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-13 p-8-8" pdfMode={pdfMode}>
                  <Input
                    className="dark right"
                    value={productLine.itemRate}
                    onChange={value => handleProductLineChange(i, 'itemRate', value)}
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-8 p-8-8" pdfMode={pdfMode}>
                  <Input
                    className="dark right"
                    placeholder="%"
                    value={productLine.igst}
                    onChange={value => handleProductLineChange(i, 'igst', value)}
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-8 p-8-8" pdfMode={pdfMode}>
                  <Input
                    className="dark right"
                    placeholder="%"
                    value={productLine.cgst}
                    onChange={value => handleProductLineChange(i, 'cgst', value)}
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-8 p-8-8" pdfMode={pdfMode}>
                  <Input
                    className="dark right"
                    placeholder="%"
                    value={productLine.sgst}
                    onChange={value => handleProductLineChange(i, 'sgst', value)}
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-13 p-8-8" pdfMode={pdfMode}>
                  <Text className="dark right" pdfMode={pdfMode}>
                    {calculateAmount(
                      productLine.quantity,
                      productLine.igst,
                      productLine.cgst,
                      productLine.sgst,
                      productLine.itemRate
                    )}
                  </Text>
                </View>
                {!pdfMode && (
                  <button
                    className="link row__remove"
                    aria-label="Remove Row"
                    title="Remove Row"
                    onClick={() => handleRemove(i)}
                  >
                    <span className="icon icon-remove bg-red"></span>
                  </button>
                )}
              </View>
            );
          })}

          {/** Add more rows | Total and Amount Due section */}
          <View className="flex gutter-margin" pdfMode={pdfMode}>
            <View className="w-60 mt-20" pdfMode={pdfMode}>
              {!pdfMode && (
                <button className="link" onClick={handleAdd}>
                  <span className="icon icon-add bg-green mr-10"></span>
                  Add Line Item
                </button>
              )}
            </View>
            <View className="w-40 mt-20" pdfMode={pdfMode}>
              <View className="flex" pdfMode={pdfMode}>
                <View className="w-50 p-5" pdfMode={pdfMode}>
                  <Text className="text-primary fs-20" pdfMode={pdfMode}>
                    {totalLabel}
                  </Text>
                </View>
                <View className="w-50 p-5" pdfMode={pdfMode}>
                  <Text className="right text-primary fs-20" pdfMode={pdfMode}>
                    {total?.toFixed(2)}
                  </Text>
                </View>
              </View>
              <View className="flex" pdfMode={pdfMode}>
                <View className="w-50 p-5" pdfMode={pdfMode}>
                  <Text pdfMode={pdfMode}>{paidLabel}</Text>
                </View>
                <View className="w-50 p-5" pdfMode={pdfMode}>
                  <Input
                    className="right text-color"
                    value={invoice.paidAmount}
                    onChange={value => handleChange('paidAmount', value)}
                    pdfMode={pdfMode}
                  />
                </View>
              </View>
              <View className="flex bg-secondary b-b-primary p-5" pdfMode={pdfMode}>
                <View className="w-50 p-5" pdfMode={pdfMode}>
                  <Text className="text-primary fs-20" pdfMode={pdfMode}>
                    {amountDue}
                  </Text>
                </View>
                <View className="w-50 p-5 flex" pdfMode={pdfMode}>
                  <Text className="text-primary right ml-30 fs-20" pdfMode={pdfMode}>
                    {currency}
                  </Text>
                  <Text className={`right text-primary w-auto ${pdfMode ? 'fs-10' : 'fs-20'}`} pdfMode={pdfMode}>
                    {(typeof total !== 'undefined' && typeof invoice.paidAmount !== 'undefined'
                      ? total - invoice.paidAmount
                      : 0
                    ).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/** Notes */}
          <View className="mt-20 gutter-margin" pdfMode={pdfMode}>
            <Text className="bold w-100" pdfMode={pdfMode}>
              {notesLabel}
            </Text>
            <Textarea
              className="w-100"
              rows={2}
              value={invoice.notes}
              onChange={value => handleChange('notes', value)}
              pdfMode={pdfMode}
            />
          </View>

          {/** Terms & Conditions */}
          <View className="mt-20 gutter-margin" pdfMode={pdfMode}>
            <Text className="bold w-100" pdfMode={pdfMode}>
              {termLabel}
            </Text>
            <Textarea
              className="w-100"
              rows={2}
              value={invoice.termAndConditions}
              onChange={value => handleChange('termAndConditions', value)}
              pdfMode={pdfMode}
            />
          </View>

          {/** Border Bottom */}
          {
            <View className="mt-30 invoice-border-bottom" pdfMode={pdfMode}>
              <Text pdfMode={pdfMode}></Text>
            </View>
          }
        </Page>
      </Document>
      {!pdfMode && (
        <button className="save-invoice" onClick={saveInvoiceDetails}>
          Save
        </button>
      )}
    </>
  );
};

export default Invoice;
