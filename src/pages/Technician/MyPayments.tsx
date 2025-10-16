import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiMoneyDollarBoxLine,
  RiRefreshLine,
  RiSearchLine,
  RiWallet3Line,
  RiCashLine,
  RiArrowDownCircleLine,
  RiMapPinLine,
  RiCalendarLine,
  RiBriefcaseLine,
  RiEyeLine,
  RiLoader4Line,
  RiAlertLine,
} from "react-icons/ri";
import toast from "react-hot-toast";
import technicianService from "../../services/technicianService";
import "./MyPayments.scss";

type TechnicianPayment = {
  id: string;
  paymentNumber: string;
  technicianId: string;
  jobId?: {
    _id: string;
    job_id: string;
    jobType: string;
    dueDate: string;
    description: string;
    property: string;
  };
  jobType?: string;
  amount: number;
  status: "Pending" | "Paid" | "Processing" | "Cancelled";
  jobCompletedAt?: string;
  createdAt: string;
  paidAt?: string;
};

type TechnicianPaymentsResponse = {
  status: string;
  message?: string;
  data?: {
    payments?: TechnicianPayment[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      limit: number;
    };
    statistics?: {
      statusCounts?: Record<string, number>;
    };
  };
};

type PaymentSummary = {
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
  totalPayments: number;
  pendingPayments: number;
  paidPayments: number;
};

const STATUS_FILTERS: Array<{ id: string; label: string }> = [
  { id: "all", label: "All" },
  { id: "Pending", label: "Pending" },
  { id: "Processing", label: "Processing" },
  { id: "Paid", label: "Paid" },
  { id: "Cancelled", label: "Cancelled" },
];

const MyPayments: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<TechnicianPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response: TechnicianPaymentsResponse =
        await technicianService.getMyPayments({ limit: 100 });

      if (response.status === "success" && response.data) {
        setPayments(response.data.payments ?? []);
        setLastUpdated(new Date().toISOString());
      } else {
        throw new Error(response.message || "Failed to fetch payments");
      }
    } catch (err: any) {
      const message = err.message || "Failed to fetch payments";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filteredPayments = useMemo(() => {
    const statusFiltered = payments.filter((payment) => {
      if (statusFilter === "all") return true;
      return payment.status === statusFilter;
    });

    if (!searchTerm) return statusFiltered;

    const term = searchTerm.toLowerCase();
    return statusFiltered.filter((payment) => {
      const paymentNumber = payment.paymentNumber?.toLowerCase() ?? "";
      const jobType = payment.jobType?.toLowerCase() ?? "";
      const jobId = payment.jobId?.job_id?.toLowerCase() ?? "";
      const property = payment.jobId?.property?.toLowerCase() ?? "";
      return (
        paymentNumber.includes(term) ||
        jobType.includes(term) ||
        jobId.includes(term) ||
        property.includes(term)
      );
    });
  }, [payments, statusFilter, searchTerm]);

  const summary: PaymentSummary = useMemo(() => {
    return filteredPayments.reduce<PaymentSummary>(
      (acc, payment) => {
        acc.totalPayments += 1;
        acc.totalAmount += payment.amount || 0;

        if (payment.status === "Pending") {
          acc.pendingPayments += 1;
          acc.pendingAmount += payment.amount || 0;
        }

        if (payment.status === "Paid") {
          acc.paidPayments += 1;
          acc.paidAmount += payment.amount || 0;
        }

        return acc;
      },
      {
        totalAmount: 0,
        pendingAmount: 0,
        paidAmount: 0,
        totalPayments: 0,
        pendingPayments: 0,
        paidPayments: 0,
      }
    );
  }, [filteredPayments]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount || 0);

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "pending";
      case "processing":
        return "processing";
      case "paid":
        return "paid";
      case "cancelled":
        return "cancelled";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Pending";
      case "processing":
        return "Processing";
      case "paid":
        return "Paid";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const handleRefresh = () => {
    fetchPayments();
  };

  const handleViewPaymentJob = (payment: TechnicianPayment) => {
    if (payment.jobId?._id) {
      navigate(`/jobs/${payment.jobId._id}`);
    }
  };

  return (
    <div className="my-payments-page">
      <div className="header-row">
        <div className="header-content">
          <div className="header-icon">
            <RiMoneyDollarBoxLine />
          </div>
          <div>
            <h1>My Payments</h1>
            <p>
              Track pending and paid invoices for the jobs you complete. Export
              data or jump straight to job details.
            </p>
            {lastUpdated && (
              <span className="last-updated">
                Last updated {new Date(lastUpdated).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <button className="btn btn-outline" onClick={handleRefresh}>
          <RiRefreshLine />
          Refresh
        </button>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="icon">
            <RiWallet3Line />
          </div>
          <div>
            <span className="label">Total Earnings</span>
            <span className="value">{formatCurrency(summary.totalAmount)}</span>
            <span className="subtext">
              {summary.totalPayments} payments recorded
            </span>
          </div>
        </div>
        <div className="summary-card warning">
          <div className="icon">
            <RiCashLine />
          </div>
          <div>
            <span className="label">Pending</span>
            <span className="value">{formatCurrency(summary.pendingAmount)}</span>
            <span className="subtext">
              {summary.pendingPayments} awaiting approval
            </span>
          </div>
        </div>
        <div className="summary-card success">
          <div className="icon">
            <RiArrowDownCircleLine />
          </div>
          <div>
            <span className="label">Paid</span>
            <span className="value">{formatCurrency(summary.paidAmount)}</span>
            <span className="subtext">
              {summary.paidPayments} payments completed
            </span>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filter-pills">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`filter-pill ${statusFilter === filter.id ? "active" : ""}`}
              onClick={() => setStatusFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="search-input">
          <RiSearchLine />
          <input
            type="text"
            placeholder="Search payments by number, job, or property"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <RiLoader4Line className="spinner" />
          <p>Loading payment history…</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <RiAlertLine />
          <div>
            <h3>We couldn't load your payments</h3>
            <p>{error}</p>
          </div>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="empty-state">
          <RiMoneyDollarBoxLine />
          <h3>No payments to show</h3>
          <p>Try adjusting your filters or check back after completing jobs.</p>
        </div>
      ) : (
        <div className="payments-grid">
          {filteredPayments.map((payment) => {
            const statusClass = getStatusBadgeClass(payment.status);
            const propertySnippet = payment.jobId?.property || "Property details";

            return (
              <div key={payment.id} className="payment-card">
                <div className="payment-header">
                  <div className="payment-number">
                    <span className="label">Payment</span>
                    <span className="number">{payment.paymentNumber}</span>
                  </div>
                  <span className={`status-badge ${statusClass}`}>
                    {getStatusLabel(payment.status)}
                  </span>
                </div>

                <div className="payment-amount">
                  <span className="value">{formatCurrency(payment.amount)}</span>
                  <span className="date">
                    Issued {new Date(payment.createdAt).toLocaleDateString()}
                  </span>
                  {payment.paidAt && (
                    <span className="date paid">
                      Paid {new Date(payment.paidAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="payment-details">
                  <div className="detail-row">
                    <RiBriefcaseLine />
                    <span>Job #{payment.jobId?.job_id || "N/A"}</span>
                  </div>
                  <div className="detail-row">
                    <RiCalendarLine />
                    <span>
                      Completed on{" "}
                      {payment.jobCompletedAt
                        ? new Date(payment.jobCompletedAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <RiMapPinLine />
                    <span>{propertySnippet}</span>
                  </div>
                </div>

                <div className="payment-actions">
                  <button
                    className="btn btn-outline"
                    onClick={() => handleViewPaymentJob(payment)}
                    disabled={!payment.jobId?._id}
                  >
                    <RiEyeLine /> View Job
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyPayments;
