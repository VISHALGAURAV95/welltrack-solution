
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { format, addDays } from "date-fns";

const styles = StyleSheet.create({
  page: { padding: 40 },
  header: { fontSize: 24, marginBottom: 20, fontWeight: "bold" },
  section: { marginBottom: 20 },
  flexRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  title: { fontSize: 14, color: "#4B5563", marginBottom: 5 },
  info: { fontSize: 12, marginBottom: 3 },
  table: { marginTop: 20 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableRow: { flexDirection: "row", marginBottom: 5 },
  col1: { width: "30%" },
  col2: { width: "40%" },
  col3: { width: "30%", textAlign: "right" },
  notes: { marginTop: 30, marginBottom: 30 },
  totals: { marginLeft: "auto", width: "200px" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  footer: { 
    position: "absolute", 
    bottom: 40, 
    left: 40, 
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 20
  },
});

interface InvoiceItem {
  item: string;
  description: string;
  amount: number;
}

interface InvoiceDocumentProps {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAddress: string;
  items: InvoiceItem[];
  notes: string;
  billDate: Date;
  billId: string;
}

export const InvoiceDocument = ({ 
  patientName,
  patientEmail,
  patientPhone,
  patientAddress,
  items,
  notes,
  billDate,
  billId
}: InvoiceDocumentProps) => {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxRate = 0.09; // 9% tax rate
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>MEDICAL BILLING INVOICE</Text>

        <View style={styles.flexRow}>
          <View style={styles.section}>
            <Text style={styles.title}>PATIENT INFORMATION</Text>
            <Text style={styles.info}>{patientName}</Text>
            <Text style={styles.info}>{patientPhone}</Text>
            <Text style={styles.info}>{patientAddress}</Text>
            <Text style={styles.info}>{patientEmail}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>PRESCRIBING PHYSICIAN'S INFORMATION</Text>
            <Text style={styles.info}>Dr. Sarah Johnson</Text>
            <Text style={styles.info}>(555) 123-4567</Text>
            <Text style={styles.info}>123 Medical Center Drive</Text>
            <Text style={styles.info}>New York, NY 10001</Text>
          </View>
        </View>

        <View style={styles.flexRow}>
          <View>
            <Text style={styles.title}>INVOICE NUMBER</Text>
            <Text style={styles.info}>{billId.slice(0, 8)}</Text>
          </View>
          <View>
            <Text style={styles.title}>DATE</Text>
            <Text style={styles.info}>{format(billDate, "MM/dd/yyyy")}</Text>
          </View>
          <View>
            <Text style={styles.title}>INVOICE DUE DATE</Text>
            <Text style={styles.info}>{format(addDays(billDate, 30), "MM/dd/yyyy")}</Text>
          </View>
          <View>
            <Text style={styles.title}>Amount DUE</Text>
            <Text style={styles.info}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>ITEM</Text>
            <Text style={styles.col2}>DESCRIPTION</Text>
            <Text style={styles.col3}>AMOUNT</Text>
          </View>
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{item.item}</Text>
              <Text style={styles.col2}>{item.description}</Text>
              <Text style={styles.col3}>${item.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.notes}>
          <Text style={styles.title}>NOTES</Text>
          <Text style={styles.info}>{notes}</Text>
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>SUBTOTAL</Text>
            <Text>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>TAX RATE</Text>
            <Text>{(taxRate * 100)}%</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>TAX</Text>
            <Text>${tax.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={{ fontWeight: "bold" }}>TOTAL</Text>
            <Text style={{ fontWeight: "bold" }}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 20, marginRight: 10 }}>🏥</Text>
            <View>
              <Text style={{ fontWeight: "bold" }}>Concordia Hill Hospital</Text>
              <Text>www.concordiahill.com</Text>
            </View>
          </View>
          <View>
            <Text style={styles.info}>For more information or any issues or concerns,</Text>
            <Text style={styles.info}>email us at invoices@concordiahill.com</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
