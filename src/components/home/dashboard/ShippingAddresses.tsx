import { useState } from 'react';
import { HiHome, HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface ShippingAddressesProps {
  className?: string;
}

export const ShippingAddresses: React.FC<ShippingAddressesProps> = ({ className = '' }) => {
  // Initialize with empty array instead of demo addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isDefault: false
  });

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If it's the first address or set as default, update other addresses
    let newAddresses = [...addresses];
    if (addressForm.isDefault) {
      newAddresses = newAddresses.map(address => ({
        ...address,
        isDefault: false
      }));
    }
    
    newAddresses.push({
      id: `${addresses.length + 1}`,
      name: addressForm.name,
      street: addressForm.street,
      city: addressForm.city,
      state: addressForm.state,
      postalCode: addressForm.postalCode,
      country: addressForm.country,
      isDefault: addressForm.isDefault || addresses.length === 0
    });
    
    setAddresses(newAddresses);
    resetForm();
  };

  const handleEditAddress = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditingAddress) return;
    
    // If set as default, update other addresses
    let updatedAddresses = [...addresses];
    if (addressForm.isDefault) {
      updatedAddresses = updatedAddresses.map(address => ({
        ...address,
        isDefault: false
      }));
    }
    
    updatedAddresses = updatedAddresses.map(address => 
      address.id === isEditingAddress 
        ? {
            ...address,
            name: addressForm.name,
            street: addressForm.street,
            city: addressForm.city,
            state: addressForm.state,
            postalCode: addressForm.postalCode,
            country: addressForm.country,
            isDefault: addressForm.isDefault || (address.isDefault && updatedAddresses.length === 1)
          } 
        : address
    );
    
    setAddresses(updatedAddresses);
    resetForm();
  };

  const handleRemoveAddress = (id: string) => {
    // Filter out the address to be removed
    let updatedAddresses = addresses.filter(address => address.id !== id);
    
    // If we removed the default address and there are other addresses, make the first one default
    if (addresses.find(a => a.id === id)?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses = updatedAddresses.map((address, index) => 
        index === 0 ? { ...address, isDefault: true } : address
      );
    }
    
    setAddresses(updatedAddresses);
  };

  const handleSetDefault = (id: string) => {
    // Update all addresses, setting isDefault to true only for the selected address
    const updatedAddresses = addresses.map(address => ({
      ...address,
      isDefault: address.id === id
    }));
    
    setAddresses(updatedAddresses);
  };

  const startEditing = (address: Address) => {
    setAddressForm({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setIsEditingAddress(address.id);
    setIsAddingAddress(false);
  };

  const resetForm = () => {
    setAddressForm({
      name: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      isDefault: false
    });
    setIsAddingAddress(false);
    setIsEditingAddress(null);
  };

  return (
    <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium text-gray-900">Shipping Addresses</h2>
        {!isAddingAddress && !isEditingAddress && (
          <button
            onClick={() => setIsAddingAddress(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none"
          >
            <HiPlus className="mr-1 h-4 w-4" />
            Add Address
          </button>
        )}
      </div>

      {addresses.length === 0 && !isAddingAddress ? (
        <div className="text-center py-8 text-gray-500">
          <HiHome className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-2 text-sm">No shipping addresses saved yet</p>
          <button
            onClick={() => setIsAddingAddress(true)}
            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
          >
            Add a Shipping Address
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Address list */}
          {!isAddingAddress && !isEditingAddress && addresses.map(address => (
            <div key={address.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-1">
                  <HiHome className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-3">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-900">{address.name}</p>
                    {address.isDefault && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>{address.street}</p>
                    <p>{address.city}, {address.state} {address.postalCode}</p>
                    <p>{address.country}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => startEditing(address)}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <HiPencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleRemoveAddress(address.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <HiTrash className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add/Edit address form */}
          {(isAddingAddress || isEditingAddress) && (
            <div className="mt-6 border rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {isAddingAddress ? 'Add New Address' : 'Edit Address'}
              </h3>
              <form onSubmit={isAddingAddress ? handleAddAddress : handleEditAddress}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Address Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Home, Work, etc."
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="street"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State / Province
                      </label>
                      <input
                        type="text"
                        id="state"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        value={addressForm.postalCode}
                        onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="isDefault"
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                      Set as default shipping address
                    </label>
                  </div>
                  
                  <div className="flex justify-end pt-2 space-x-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                    >
                      {isAddingAddress ? 'Save Address' : 'Update Address'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 