// Composables for CRM-specific operations
import type { Lead, Opportunity, Customer, Order } from "~/types/crm.types";

/**
 * Composable for CRM workflow operations
 */
export const useCrmWorkflows = () => {
  const request = useRequest();

  /**
   * Convert a lead to an opportunity
   */
  const convertLeadToOpportunity = async (
    leadId: number,
    opportunityData: {
      name: string;
      amount: number;
      expectedCloseDate: string;
      probability?: number;
    },
  ) => {
    try {
      // 1. Get lead data
      const lead = await request<Lead>(`/api/leads/${leadId}`);

      // 2. Create opportunity
      const opportunity = await request<Opportunity>("/api/opportunities", {
        method: "POST",
        body: {
          customerId: lead.customerId,
          userId: lead.userId,
          stage: "Prospecting",
          ...opportunityData,
        },
      });

      // 3. Update lead status to Converted
      await request(`/api/leads/${leadId}`, {
        method: "PATCH",
        body: {
          status: "Converted",
        },
      });

      ElMessage.success("Lead converted to opportunity successfully!");
      return opportunity;
    } catch (error) {
      ElMessage.error("Failed to convert lead");
      throw error;
    }
  };

  /**
   * Create order from opportunity
   */
  const createOrderFromOpportunity = async (
    opportunityId: number,
    orderData: any,
  ) => {
    try {
      const opportunity = await request<Opportunity>(
        `/api/opportunities/${opportunityId}`,
      );

      const order = await request("/api/orders", {
        method: "POST",
        body: {
          customerId: opportunity.customerId,
          userId: opportunity.userId,
          ...orderData,
        },
      });

      // Update opportunity to Closed_Won
      await request(`/api/opportunities/${opportunityId}`, {
        method: "PATCH",
        body: {
          stage: "Closed_Won",
          actualCloseDate: new Date().toISOString(),
        },
      });

      ElMessage.success("Order created successfully!");
      return order;
    } catch (error) {
      ElMessage.error("Failed to create order");
      throw error;
    }
  };

  /**
   * Log interaction and create follow-up task
   */
  const logInteractionWithFollowUp = async (
    interactionData: any,
    taskData: any,
  ) => {
    try {
      // 1. Log the interaction
      const interaction = await request("/api/interactions", {
        method: "POST",
        body: interactionData,
      });

      // 2. Create follow-up task if provided
      if (taskData) {
        const task = await request("/api/tasks", {
          method: "POST",
          body: {
            customerId: interactionData.customerId,
            ...taskData,
          },
        });

        ElMessage.success("Interaction logged and follow-up task created!");
        return { interaction, task };
      }

      ElMessage.success("Interaction logged successfully!");
      return { interaction };
    } catch (error) {
      ElMessage.error("Failed to log interaction");
      throw error;
    }
  };

  return {
    convertLeadToOpportunity,
    createOrderFromOpportunity,
    logInteractionWithFollowUp,
  };
};

/**
 * Composable for CRM statistics
 */
export const useCrmStats = () => {
  const request = useRequest();

  const fetchDashboardStats = async (dateRange?: {
    startDate: string;
    endDate: string;
  }) => {
    try {
      const params = dateRange
        ? {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          }
        : {};

      const [customers, leads, opportunities, orders] = await Promise.all([
        request<Customer[]>("/api/customers", { params }),
        request<Lead[]>("/api/leads", { params }),
        request<Opportunity[]>("/api/opportunities", { params }),
        request<Order[]>("/api/orders", { params }),
      ]);

      return {
        totalCustomers: customers.length,
        totalLeads: leads?.length || 0,
        totalOpportunities: opportunities.length,
        totalOrders: orders.length,
        totalRevenue: orders.reduce(
          (sum: number, order: any) => sum + (order.grandTotal || 0),
          0,
        ),
        conversionRate:
          leads?.length > 0
            ? ((opportunities.length / (leads?.length || 1)) * 100).toFixed(2)
            : 0,
      };
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      return null;
    }
  };

  const fetchLeadsByStatus = async () => {
    try {
      const leads = await request<Lead[]>("/api/leads");

      return leads.reduce((acc: any, lead: any) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {});
    } catch (error) {
      console.error("Failed to fetch leads by status:", error);
      return {};
    }
  };

  const fetchOpportunitiesByStage = async () => {
    try {
      const opportunities = await request<Opportunity[]>("/api/opportunities");

      return opportunities.reduce((acc: any, opp: any) => {
        acc[opp.stage] = (acc[opp.stage] || 0) + 1;
        return acc;
      }, {});
    } catch (error) {
      console.error("Failed to fetch opportunities by stage:", error);
      return {};
    }
  };

  return {
    fetchDashboardStats,
    fetchLeadsByStatus,
    fetchOpportunitiesByStage,
  };
};
