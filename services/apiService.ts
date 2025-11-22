
import { supabase, supabaseUrl, supabaseKey } from './supabaseClient';
import { createClient } from '@supabase/supabase-js';
import { User, Role, TaxpayerType, TaxAssessment, TaxType, AssessmentStatus, Document, DocumentStatus, TccStatus, TCCRequest, Payment, Notification, TaxConfiguration } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI } from '@google/genai';

// --- Conversion Helpers ---
// The Supabase client library automatically converts snake_case from the DB to camelCase.
// Since the user requested the frontend components use snake_case, we must convert it back.
const snakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const convertKeysToSnake = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => convertKeysToSnake(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((acc: { [key: string]: any }, key: string) => {
            const newKey = snakeCase(key);
            acc[newKey] = convertKeysToSnake(obj[key]);
            return acc;
        }, {});
    }
    return obj;
};


// --- Helper function for creating notifications ---
const createNotification = async (userId: string, title: string, message: string) => {
    await supabase.from('notifications').insert({ user_id: userId, title, message });
};

// --- Helper to notify all Admins ---
const notifyAdmins = async (title: string, message: string) => {
    const { data: admins, error } = await supabase.from('profiles').select('id').eq('role', Role.ADMIN);
    if (admins && !error) {
        const notifications = admins.map(admin => createNotification(admin.id, title, message));
        await Promise.all(notifications);
    }
};


// --- Auth ---

// New function to check for admin
export const hasAdminAccount = async (): Promise<boolean> => {
    const { error, count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', Role.ADMIN);
    
    if (error) {
        console.error("Error checking for admin account:", error.message);
        return false; // Fail safe
    }
    
    return (count || 0) > 0;
};

// New function to create the first admin
export const createInitialAdmin = async (name: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    // Double-check no admin exists before proceeding
    const adminExists = await hasAdminAccount();
    if (adminExists) {
        return { success: false, error: 'An administrator account already exists.' };
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password: pass });

    if (authError || !authData.user) {
        console.error("Initial admin auth creation error:", authError?.message);
        return { success: false, error: authError?.message || 'Failed to create authentication credentials.' };
    }

    const tin = 'ADMIN-000000'; 

    const { error: profileError } = await supabase
        .from('profiles')
        .insert({
            id: authData.user.id,
            name,
            tin,
            email,
            role: Role.ADMIN,
            avatar_url: `https://i.pravatar.cc/150?u=${authData.user.id}`,
            taxpayer_type: TaxpayerType.INDIVIDUAL,
        });
    
    if (profileError) {
        console.error("Initial admin profile creation error:", profileError.message);
        return { success: false, error: `Profile creation failed: ${profileError.message}` };
    }

    return { success: true };
};


export const signUp = async (name: string, tin: string, email: string, pass: string, taxpayer_type: TaxpayerType): Promise<{ success: boolean; error?: string }> => {
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password: pass });

    if (authError || !authData.user) {
        console.error("Auth sign up error:", authError?.message);
        return { success: false, error: authError?.message || 'Failed to create authentication credentials.' };
    }

    const { error: profileError } = await supabase
        .from('profiles')
        .insert({
            id: authData.user.id,
            name,
            tin,
            email,
            role: Role.TAXPAYER,
            avatar_url: `https://i.pravatar.cc/150?u=${authData.user.id}`,
            taxpayer_type,
        });
    
    if (profileError) {
        console.error("Profile creation error:", profileError.message);
        if (profileError.message.includes('duplicate key value violates unique constraint "profiles_tin_key"')) {
             return { success: false, error: 'This Tax Identification Number (TIN) is already in use.' };
        }
        return { success: false, error: `Profile creation failed: ${profileError.message}` };
    }

    // Notify Admins about new user
    await notifyAdmins('New Taxpayer Registration', `A new taxpayer, ${name} (${tin}), has registered on the portal.`);

    return { success: true };
}

// Function for Admin to create users without logging themselves out
export const adminCreateUser = async (name: string, email: string, pass: string, role: Role, tin?: string): Promise<{ success: boolean; error?: string }> => {
    // CREATE A TEMPORARY CLIENT to avoid logging out the current admin user
    const tempSupabase = createClient(supabaseUrl, supabaseKey);

    const { data: authData, error: authError } = await tempSupabase.auth.signUp({ email, password: pass });

    if (authError || !authData.user) {
        console.error("Admin create user auth error:", authError?.message);
        return { success: false, error: authError?.message || 'Failed to create credentials.' };
    }

    // Generate a random TIN if not provided (for Officers/Admins)
    const finalTin = tin || `TEMP-${Math.floor(100000 + Math.random() * 900000)}`;

    const { error: profileError } = await supabase // Use the main client (admin rights) to insert profile if possible, or temp client if RLS allows own-insert
        .from('profiles')
        .insert({
            id: authData.user.id,
            name,
            tin: finalTin,
            email,
            role,
            avatar_url: `https://i.pravatar.cc/150?u=${authData.user.id}`,
            taxpayer_type: TaxpayerType.INDIVIDUAL, // Default for staff
        });

    if (profileError) {
        console.error("Admin create user profile error:", profileError.message);
        return { success: false, error: `Profile creation failed: ${profileError.message}` };
    }

    // Clean up temp auth session immediately (optional, as garbage collection handles it, but good practice)
    await tempSupabase.auth.signOut();

    // Notify other Admins
    await notifyAdmins('New Staff Account', `A new ${role} account has been created for ${name}.`);

    return { success: true };
}

export const verifyEmailOtp = async (email: string, token: string): Promise<{ success: boolean; error?: string }> => {
    if (!email) return { success: false, error: "Email address is required." };
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
    if (error) {
        console.error("OTP verification error:", error.message);
        return { success: false, error: error.message };
    }
    return { success: true };
}

export const resendSignUpCode = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!email) return { success: false, error: "Email address is required." };
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
        console.error("Resend code error:", error.message);
        return { success: false, error: error.message };
    }
    return { success: true };
}

export const signIn = async (email: string, pass: string): Promise<{ user: User | null, error: string | null }> => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (authError || !authData.user) {
        console.error('Sign in error:', authError?.message);
        return { user: null, error: authError?.message || 'Sign in failed' };
    }
    const profile = await getUserProfile(authData.user.id);
    return { user: profile, error: null };
}

export const signOut = async () => {
    await supabase.auth.signOut();
}

export const getCurrentUser = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Error getting current session:', error.message);
        return null;
    }
    return data.session?.user;
}

// --- Profiles ---
export const getUserProfile = async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
    }
    return convertKeysToSnake(data) as User;
}

export const updateUserProfile = async (userId: string, updatedData: Partial<User>): Promise<User | null> => {
    const { data, error } = await supabase.from('profiles').update(updatedData).eq('id', userId).select().single();
    if (error) {
        console.error('Error updating profile:', error.message);
        return null;
    }
    return convertKeysToSnake(data) as User;
}

export const uploadAvatar = async (userId: string, file: File): Promise<string | null> => {
    const fileExtension = file.name.split('.').pop();
    const fileName = `avatars/${userId}/${uuidv4()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file, {
        upsert: true
    });

    if (uploadError) {
        console.error('Error uploading avatar:', uploadError.message);
        return null;
    }

    const { data } = supabase.storage.from('documents').getPublicUrl(fileName);
    const publicUrl = data.publicUrl;

    // Update profile
    const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);

    if (updateError) {
        console.error('Error updating profile with avatar:', updateError.message);
        return null;
    }

    return publicUrl;
};

export const getAllTaxpayers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('role', Role.TAXPAYER);
    if (error) {
        console.error('Error fetching taxpayers:', error.message);
        return [];
    }
    return convertKeysToSnake(data) as User[];
};

export const getAllUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) return [];
    return convertKeysToSnake(data) as User[];
};

// --- Tax Configurations ---
export const getTaxConfigurations = async (): Promise<TaxConfiguration[]> => {
    const { data, error } = await supabase.from('tax_configurations').select('*');
    if (error) {
        console.error('Error fetching tax configurations:', error.message);
        return [];
    }
    return convertKeysToSnake(data);
};

export const updateTaxConfigurations = async (configs: TaxConfiguration[]): Promise<boolean> => {
    const { error } = await supabase.from('tax_configurations').upsert(configs, { onConflict: 'tax_type' });
    if (error) {
        console.error('Error updating tax configurations:', error.message);
        return false;
    }
    return true;
};

// --- Assessments ---
export const getAssessmentsForUser = async (userId: string): Promise<TaxAssessment[]> => {
    const { data, error } = await supabase.from('assessments').select('*, profiles(name, tin, email, taxpayer_type)').eq('taxpayer_id', userId).order('due_date', { ascending: false });
    if (error) {
        console.error('Error fetching assessments:', error.message);
        return [];
    }
    return convertKeysToSnake(data) as TaxAssessment[];
};

export const getAllAssessments = async (): Promise<TaxAssessment[]> => {
    const { data, error } = await supabase.from('assessments').select('*, profiles(name, tin, email, taxpayer_type)');
    if (error) return [];
    return convertKeysToSnake(data) as TaxAssessment[];
}

export const getAssessmentById = async (id: string): Promise<TaxAssessment | null> => {
    const { data, error } = await supabase.from('assessments').select('*').eq('id', id).single();
    if (error) return null;
    return convertKeysToSnake(data);
}

export const createAssessment = async (newAssessmentData: { taxpayer_id: string, tax_type: TaxType, taxable_income: number, period: string }): Promise<TaxAssessment | null> => {
    const { data: config, error: configError } = await supabase.from('tax_configurations').select('rate').eq('tax_type', newAssessmentData.tax_type).single();
    if (configError || !config) {
        console.error('Error fetching tax rate for assessment:', configError?.message);
        return null;
    }
    const taxRate = config.rate;
    const amountDue = newAssessmentData.taxable_income * (taxRate / 100);
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const assessmentToInsert = { ...newAssessmentData, tax_rate_applied: taxRate, amount_due: amountDue, status: AssessmentStatus.ASSESSED, due_date: dueDate };
    const { data, error } = await supabase.from('assessments').insert(assessmentToInsert).select('*, profiles(name, tin, email, taxpayer_type)').single();
    if (error) {
        console.error('Error creating assessment:', error.message);
        return null;
    }
    if (data) {
        await createNotification(data.taxpayer_id, 'New Tax Assessment', `A new assessment for the period ${data.period} has been issued.`);
    }
    return convertKeysToSnake(data) as TaxAssessment;
};

// --- Payments ---
export const processPayment = async (assessmentId: string, taxpayerId: string, amount: number): Promise<boolean> => {
    const { error } = await supabase.rpc('process_payment', { p_assessment_id: assessmentId, p_taxpayer_id: taxpayerId, p_amount: amount });
    if (error) {
        console.error('Error processing payment:', error);
        return false;
    }
    await createNotification(taxpayerId, 'Payment Successful', `Your payment of $${amount.toLocaleString()} has been successfully processed.`);
    
    // Alert Admins for High-Value Transactions (e.g., over $50,000)
    if (amount > 50000) {
        await notifyAdmins('High Value Transaction', `A large payment of $${amount.toLocaleString()} was received from Taxpayer ID: ${taxpayerId}.`);
    }
    
    return true;
}

export const getPaymentsForUser = async (userId: string): Promise<Payment[]> => {
    const { data, error } = await supabase.from('payments').select('*').eq('taxpayer_id', userId).order('payment_date', { ascending: false });
    if (error) return [];
    return convertKeysToSnake(data);
}

// --- Documents ---
export const uploadDocument = async (file: File, userId: string, docType: string): Promise<{ data: Document | null, error: string | null }> => {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}/${docType.replace(' ', '_')}_${uuidv4()}.${fileExtension}`;
    
    const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file);
    if (uploadError) {
        console.error('Error uploading file (Check RLS Policies):', uploadError.message);
        return { data: null, error: uploadError.message };
    }
    
    const newDoc = { taxpayer_id: userId, document_name: file.name, file_url: fileName, status: DocumentStatus.PENDING_REVIEW, upload_date: new Date().toISOString() };
    const { data, error: dbError } = await supabase.from('documents').insert(newDoc).select('*, profiles(name, tin, email, taxpayer_type)').single();
    if (dbError) {
        console.error('Error saving document record:', dbError.message);
        return { data: null, error: dbError.message };
    }
    
    const { data: staff, error: staffError } = await supabase.from('profiles').select('id').in('role', [Role.ADMIN, Role.OFFICER]);
    if (staff && !staffError) {
        const notifications = staff.map(s => createNotification(s.id, 'New Document for Review', `A new document has been uploaded by a taxpayer and requires your review.`));
        await Promise.all(notifications);
    }
    return { data: convertKeysToSnake(data) as Document, error: null };
};

export const getDocumentsForUser = async (userId: string): Promise<Document[]> => {
    const { data, error } = await supabase.from('documents').select('*, profiles(name, tin, email, taxpayer_type)').eq('taxpayer_id', userId);
    if (error) return [];
    return convertKeysToSnake(data) as Document[];
}

export const getAllDocuments = async (): Promise<Document[]> => {
    const { data, error } = await supabase.from('documents').select('*, profiles(name, tin, email, taxpayer_type)');
    if (error) return [];
    return convertKeysToSnake(data) as Document[];
}

export const updateDocumentStatus = async (docId: string, status: DocumentStatus): Promise<Document | null> => {
    const { data, error } = await supabase.from('documents').update({ status }).eq('id', docId).select('*, profiles(name, tin, email, taxpayer_type)').single();
    if (error) {
        console.error("Error updating doc status:", error.message);
        return null;
    }
    if (data) {
        await createNotification(data.taxpayer_id, `Document ${status}`, `Your document "${data.document_name}" has been ${status.toLowerCase()}.`);
    }
    return convertKeysToSnake(data) as Document;
}

export const getPublicFileUrl = (filePath: string): string | null => {
    const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
    if (data) {
        return data.publicUrl;
    }
    console.error('Error getting public URL for file:', filePath);
    return null;
}

// --- TCC Requests ---
export const getTccRequestForUser = async (userId: string): Promise<TCCRequest | null> => {
    const { data, error } = await supabase.from('tcc_requests').select('*, profiles(name, tin, email, taxpayer_type)').eq('taxpayer_id', userId).maybeSingle();
    if (error) return null;
    return convertKeysToSnake(data) as TCCRequest;
}

export const getAllTccRequests = async (): Promise<TCCRequest[]> => {
    const { data, error } = await supabase.from('tcc_requests').select('*, profiles(name, tin, email, taxpayer_type)').order('request_date', { ascending: false });
    if (error) {
        console.error('Error fetching all TCC requests:', error.message);
        return [];
    }
    return convertKeysToSnake(data) as TCCRequest[];
};

export const createTccRequest = async (userId: string): Promise<TCCRequest | null> => {
    const { data, error } = await supabase.from('tcc_requests').upsert({ taxpayer_id: userId, request_date: new Date().toISOString(), status: TccStatus.PENDING }, { onConflict: 'taxpayer_id' }).select('*, profiles(name, tin, email, taxpayer_type)').single();
    if (error) {
        console.error('Error creating TCC request:', error.message);
        return null;
    }
    const { data: staff, error: staffError } = await supabase.from('profiles').select('id').in('role', [Role.ADMIN, Role.OFFICER]);
    if (staff && !staffError) {
        const notifications = staff.map(s => createNotification(s.id, 'New TCC Request', `A taxpayer has submitted a new TCC request requiring review.`));
        await Promise.all(notifications);
    }
    return convertKeysToSnake(data) as TCCRequest;
}

export const updateTccRequestStatus = async (reqId: string, status: TccStatus, userId: string): Promise<TCCRequest | null> => {
    const { data, error } = await supabase.from('tcc_requests').update({ status }).eq('id', reqId).select('*, profiles(name, tin, email, taxpayer_type)').single();
    if (error) {
        console.error('Error updating TCC status:', error.message);
        return null;
    }
    if (data) {
        await createNotification(userId, `TCC Request ${status}`, `Your Tax Clearance Certificate request has been ${status.toLowerCase()}.`);
    }
    return convertKeysToSnake(data);
};

// --- Notifications ---
export const getNotificationsForUser = async (userId: string): Promise<Notification[]> => {
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (error) return [];
    return convertKeysToSnake(data) as Notification[];
}

// --- Gemini Chatbot ---
let ai: GoogleGenAI;

export const getChatbotResponse = async (message: string): Promise<string> => {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("API Key is missing. Please check your .env file and ensure API_KEY is set.");
            return "I'm currently offline due to a configuration issue (Missing API Key).";
        }

        if (!ai) {
             ai = new GoogleGenAI({ apiKey });
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction: `You are a helpful and friendly tax assistant for a Nigerian Tax Management System. 
                Your purpose is to answer questions about Nigerian taxes clearly and simply for the average person.
                Refer to concepts like PAYE (Pay-As-You-Earn), TIN (Taxpayer Identification Number), Capital Gains Tax, and Withholding Tax.
                Keep your answers concise and easy to understand. Do not invent information. If you don't know an answer, say so.
                Do not provide financial advice.`,
            },
        });

        if (response.text) {
             return response.text;
        }
        
        return "I couldn't generate a response to that specific query.";

    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.";
    }
};
